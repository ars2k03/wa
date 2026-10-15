import { BadRequestException, ForbiddenException, Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { Redis } from 'ioredis';
import QRCode from 'qrcode';
import pino from 'pino';
import type { WASocket } from 'baileys';
import { ConfigService } from '@nestjs/config';
import { useRedisAuthState } from '../redis/redis-auth-state.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { InitSessionDto } from './dto/init-session.dto.js';

export type WhatsAppConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'qr_ready';

export interface WhatsAppSession {
  sessionId: string;
  userId?: string;
  socket: WASocket | null;
  status: WhatsAppConnectionStatus;
  qr: string | null;
  qrRaw: string | null;
  phoneNumber: string | null;
  reconnectTimer?: NodeJS.Timeout;
  connectAttempt: number; // Incremented per connect; lets stale/overlapping connects bail out
  linking: boolean; // QR was scanned, waiting for WhatsApp to finish the handshake
  qrRefreshing: boolean; // Old QR expired, a fresh one is being generated
  qrExpired: boolean; // QR socket timed out unscanned; user must click to request a new one
  lastError: string | null;
}

export interface SessionInfo {
  sessionId: string;
  status: WhatsAppConnectionStatus;
  qr: string | null; // Base64 data URL (e.g. data:image/png;base64,...) for direct <img> display
  qrRaw: string | null; // Raw string for React QR components
  phoneNumber: string | null;
  linking: boolean;
  qrRefreshing: boolean;
  qrExpired: boolean;
  lastError: string | null;
}

const REDIS_SESSIONS_SET = 'whatsapp:active_sessions';
const RECONNECT_DELAY_MS = 3000;

@Injectable()
export class WhatsappSessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappSessionService.name);
  private redis: Redis | null = null;
  private readonly sessions = new Map<string, WhatsAppSession>();
  private destroyed = false;
  private defaultSessionId = 'default';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.defaultSessionId = 'default';

    const redisUrl =
      this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';

    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 500, 3000);
      },
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });

    try {
      await this.restorePersistedSessions();
    } catch (err) {
      this.logger.error('Failed to restore WhatsApp sessions', err);
    }
  }

  onModuleDestroy() {
    this.destroyed = true;
    for (const session of this.sessions.values()) {
      if (session.reconnectTimer) {
        clearTimeout(session.reconnectTimer);
      }
      void session.socket?.end(new Error('Application shutting down'));
    }
    this.sessions.clear();
    this.redis?.disconnect();
  }

  private async restorePersistedSessions() {
    if (!this.redis) return;

    // Only restore active connected sessions that belong to actual registered users
    const dbRecords = await this.prisma.whatsAppSessionRecord.findMany({
      where: { status: 'connected' },
      select: { sessionId: true, userId: true },
    });

    if (dbRecords.length === 0) {
      this.logger.log('No active WhatsApp sessions to restore on startup.');
      return;
    }

    this.logger.log(
      `Restoring ${dbRecords.length} active session(s) from database`,
    );

    for (const record of dbRecords) {
      void (async () => {
        try {
          await this.initSession(record.sessionId, record.userId);
        } catch (err) {
          this.logger.error(`Error restoring session "${record.sessionId}":`, err);
        }
      })();
    }
  }

  /**
   * Resolves the session identifier for a user.
   * Maps to user:<email>:session for clean Redis namespacing and 100% isolation.
   */
  async resolveSessionId(sessionId?: string, userId?: string): Promise<string> {
    if (!userId) {
      return sessionId || this.defaultSessionId;
    }

    if (sessionId && sessionId !== 'default' && sessionId !== 'me') {
      return sessionId;
    }

    // Check existing in DB
    const existingDb = await this.prisma.whatsAppSessionRecord.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { sessionId: true },
    });
    if (existingDb) {
      return existingDb.sessionId;
    }

    // Check in-memory
    for (const [sId, s] of this.sessions.entries()) {
      if (s.userId === userId) {
        return sId;
      }
    }

    // Lookup user email to construct user:<email>:session
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const userEmail = user?.email || userId;
    return `user:${userEmail}:session`;
  }

  /**
   * Prevents IDOR by verifying that the requesting user owns the session
   */
  async verifySessionOwnership(sessionId: string, userId?: string): Promise<void> {
    if (!userId) return;

    // Check in-memory session owner
    const memorySession = this.sessions.get(sessionId);
    if (memorySession?.userId && memorySession.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to access session "${sessionId}"`,
      );
    }

    // Check PostgreSQL database owner
    const dbRecord = await this.prisma.whatsAppSessionRecord.findUnique({
      where: { sessionId },
      select: { userId: true },
    });
    if (dbRecord && dbRecord.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to access session "${sessionId}"`,
      );
    }
  }

  /**
   * Initializes or gets a session, generating QR code for the frontend
   */
  async initSession(
    sessionId: string = this.defaultSessionId,
    body?: InitSessionDto | string,
  ): Promise<SessionInfo> {
    const userId = typeof body === 'object' && body ? body.userId : body;
    const resolvedSessionId = await this.resolveSessionId(sessionId, userId);
    sessionId = resolvedSessionId;

    // Prevent IDOR: Check ownership before initializing or reusing an existing session
    if (userId) {
      await this.verifySessionOwnership(sessionId, userId);
    }

    const existing = this.sessions.get(sessionId);
    if (existing && this.isSessionActive(existing)) {
      if (userId && !existing.userId) {
        existing.userId = userId;
        await this.syncSessionToDatabase(existing);
      }
      return this.toSessionInfo(existing);
    }

    if (!this.redis) {
      throw new ServiceUnavailableException('Redis is not ready');
    }

    const session: WhatsAppSession = existing ?? {
      sessionId,
      userId,
      socket: null,
      status: 'connecting',
      qr: null,
      qrRaw: null,
      phoneNumber: null,
      connectAttempt: 0,
      linking: false,
      qrRefreshing: false,
      qrExpired: false,
      lastError: null,
    };
    if (userId) {
      session.userId = userId;
    }
    // A user-initiated init always starts a fresh QR cycle
    session.status = 'connecting';
    session.qr = null;
    session.qrRaw = null;
    session.linking = false;
    session.qrRefreshing = false;
    session.qrExpired = false;
    session.lastError = null;
    this.sessions.set(sessionId, session);

    // Sync initialization to PostgreSQL
    if (session.userId) {
      await this.syncSessionToDatabase(session);
    }

    await this.connectSession(session);
    return this.toSessionInfo(session);
  }

  /**
   * A session is "active" when it is connected, showing a QR, or has a socket /
   * pending reconnect in flight. Anything else (e.g. stuck in 'connecting' with
   * no socket) can safely be restarted.
   */
  private isSessionActive(session: WhatsAppSession): boolean {
    if (session.status === 'connected' || session.status === 'qr_ready') {
      return true;
    }
    if (session.status === 'connecting') {
      return Boolean(session.socket || session.reconnectTimer);
    }
    return false;
  }

  private scheduleReconnect(session: WhatsAppSession, delayMs: number) {
    if (this.destroyed) return;
    if (session.reconnectTimer) {
      clearTimeout(session.reconnectTimer);
    }
    session.reconnectTimer = setTimeout(() => {
      session.reconnectTimer = undefined;
      void this.connectSession(session).catch((err) => {
        this.logger.error(`[Session: ${session.sessionId}] Reconnect failed:`, err);
        this.scheduleReconnect(session, RECONNECT_DELAY_MS);
      });
    }, delayMs);
  }

  private async connectSession(session: WhatsAppSession) {
    if (!this.redis || this.destroyed) return;
    // Session was deleted while a reconnect was pending
    if (this.sessions.get(session.sessionId) !== session) return;

    const attempt = ++session.connectAttempt;
    if (session.reconnectTimer) {
      clearTimeout(session.reconnectTimer);
      session.reconnectTimer = undefined;
    }

    // Close any previous socket. Its events are ignored by the stale-socket guard below,
    // so it can't trigger a duplicate reconnect (the old 440 ping-pong).
    const previous = session.socket;
    session.socket = null;
    if (previous) {
      try {
        previous.end(new Error('Replaced by a new connection'));
      } catch {
        /* ignore */
      }
    }

    if (session.status === 'qr_ready') {
      // Keep the expired QR visible (frontend dims it) until the fresh one arrives
      session.qrRefreshing = true;
    } else {
      session.status = 'connecting';
    }

    const {
      default: makeWASocket,
      DisconnectReason,
      fetchLatestBaileysVersion,
    } = await import('baileys');

    const redisSessionKey = session.sessionId.startsWith('user:')
      ? session.sessionId
      : `user:${session.sessionId}:session`;

    const { state, saveCreds } = await useRedisAuthState(
      this.redis,
      redisSessionKey,
    );

    const { version } = await fetchLatestBaileysVersion();

    // Another connect started (or the session was deleted) while we were awaiting
    if (
      attempt !== session.connectAttempt ||
      this.destroyed ||
      this.sessions.get(session.sessionId) !== session
    ) {
      return;
    }

    const socket = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    session.socket = socket;

    socket.ev.on('creds.update', saveCreds);

    const isCurrent = () =>
      session.socket === socket &&
      !this.destroyed &&
      this.sessions.get(session.sessionId) === session;

    socket.ev.on('connection.update', async ({ connection, qr, lastDisconnect, isNewLogin }) => {
      if (!isCurrent()) return;

      if (qr) {
        let dataUrl: string | null = null;
        try {
          // Generate high quality base64 image data URL for frontend <img>
          dataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            width: 320,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          });
        } catch {
          dataUrl = null;
        }
        // The QR may have been scanned or the socket replaced while rendering
        if (!isCurrent() || session.linking || session.status === 'connected') return;

        const isRefresh = session.status === 'qr_ready';
        session.qr = dataUrl;
        session.qrRaw = qr;
        session.status = 'qr_ready';
        session.qrRefreshing = false;
        session.qrExpired = false;
        session.lastError = null;
        if (!isRefresh) {
          this.logger.log(`[Session: ${session.sessionId}] WhatsApp QR code generated for frontend.`);
        }
      }

      if (isNewLogin) {
        // QR was scanned on the phone; WhatsApp now restarts the socket (515) to finish linking
        session.linking = true;
        session.status = 'connecting';
        session.qr = null;
        session.qrRaw = null;
        session.qrRefreshing = false;
        this.logger.log(`[Session: ${session.sessionId}] QR scanned, linking device...`);
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.qr = null;
        session.qrRaw = null;
        session.linking = false;
        session.qrRefreshing = false;
        session.qrExpired = false;
        session.lastError = null;
        session.phoneNumber = socket.user?.id
          ? socket.user.id.split(':')[0]
          : null;

        void this.redis?.sadd(REDIS_SESSIONS_SET, session.sessionId);
        this.logger.log(
          `[Session: ${session.sessionId}] WhatsApp connected (${session.phoneNumber ?? 'Unknown'})`,
        );

        // Update connected state in PostgreSQL
        await this.syncSessionToDatabase(session);
      }

      if (connection === 'close') {
        session.socket = null;

        const statusCode = (
          lastDisconnect?.error as {
            output?: { statusCode?: number };
          }
        )?.output?.statusCode;

        if (
          statusCode === DisconnectReason.loggedOut ||
          statusCode === 401 ||
          statusCode === 403
        ) {
          this.resetToDisconnected(
            session,
            session.linking
              ? 'Linking was rejected by WhatsApp. Please generate a new QR code and try again.'
              : 'This device was logged out from WhatsApp. Scan a new QR code to reconnect.',
          );
          session.phoneNumber = null;
          this.logger.warn(
            `[Session: ${session.sessionId}] WhatsApp session logged out. Needs fresh QR scan.`,
          );
          void this.redis?.srem(REDIS_SESSIONS_SET, session.sessionId);
          // Drop the revoked creds so the next connect starts fresh and gets a new QR,
          // instead of retrying the dead creds and hitting loggedOut again.
          await this.redis?.del(redisSessionKey);
          await this.syncSessionToDatabase(session);
        } else if (
          statusCode === DisconnectReason.connectionReplaced ||
          statusCode === 440
        ) {
          // Another client (e.g. a second server instance) took over these credentials.
          // Don't auto-reconnect (avoids a 440 ping-pong), but don't leave the UI spinning either.
          this.resetToDisconnected(
            session,
            'This WhatsApp session was opened from another place. Reconnect to take it back.',
          );
          this.logger.warn(
            `[Session: ${session.sessionId}] Connection replaced by another socket. Not reconnecting.`,
          );
          await this.syncSessionToDatabase(session);
        } else if (statusCode === DisconnectReason.restartRequired) {
          // Expected right after a QR scan; reconnect immediately to finish linking
          this.logger.log(`[Session: ${session.sessionId}] Restart required after pairing, reconnecting...`);
          this.scheduleReconnect(session, 0);
        } else if (
          statusCode === DisconnectReason.timedOut &&
          session.status === 'qr_ready' &&
          !session.linking
        ) {
          // Nobody scanned this socket's QR codes in time. Like WhatsApp Web, don't open a
          // new socket automatically; keep the last QR so the UI can show it dimmed with a
          // reload button, and wait for the user to request a fresh one.
          const lastQr = session.qr;
          const lastQrRaw = session.qrRaw;
          this.resetToDisconnected(session, null);
          session.qr = lastQr;
          session.qrRaw = lastQrRaw;
          session.qrExpired = true;
          this.logger.log(
            `[Session: ${session.sessionId}] QR expired, waiting for user to request a new one.`,
          );
        } else {
          this.logger.warn(
            `[Session: ${session.sessionId}] WhatsApp disconnected (statusCode: ${statusCode ?? 'unknown'}), reconnecting...`,
          );
          this.scheduleReconnect(session, RECONNECT_DELAY_MS);
        }
      }
    });
  }

  private resetToDisconnected(session: WhatsAppSession, error: string | null) {
    if (session.reconnectTimer) {
      clearTimeout(session.reconnectTimer);
      session.reconnectTimer = undefined;
    }
    session.status = 'disconnected';
    session.qr = null;
    session.qrRaw = null;
    session.linking = false;
    session.qrRefreshing = false;
    session.lastError = error;
  }

  async getSessionStatus(
    sessionId: string = this.defaultSessionId,
    userId?: string,
  ): Promise<SessionInfo> {
    const resolvedSessionId = await this.resolveSessionId(sessionId, userId);
    sessionId = resolvedSessionId;

    if (userId) {
      await this.verifySessionOwnership(sessionId, userId);
    }

    let session = this.sessions.get(sessionId);
    if (!session) {
      // Check if database has an existing connected record
      const dbRecord = await this.prisma.whatsAppSessionRecord.findUnique({
        where: { sessionId },
      });
      if (dbRecord && dbRecord.status === 'connected') {
        session = {
          sessionId,
          userId: dbRecord.userId,
          socket: null,
          status: 'connected',
          qr: null,
          qrRaw: null,
          phoneNumber: dbRecord.phoneNumber,
          connectAttempt: 0,
          linking: false,
          qrRefreshing: false,
          qrExpired: false,
          lastError: null,
        };
        this.sessions.set(sessionId, session);
        // Connect socket in background
        void this.connectSession(session);
      }
    }

    if (!session) {
      return {
        sessionId,
        status: 'disconnected',
        qr: null,
        qrRaw: null,
        phoneNumber: null,
        linking: false,
        qrRefreshing: false,
        qrExpired: false,
        lastError: null,
      };
    }
    return this.toSessionInfo(session);
  }

  async deleteSession(sessionId: string, userId?: string): Promise<void> {
    const resolvedSessionId = await this.resolveSessionId(sessionId, userId);
    sessionId = resolvedSessionId;

    if (userId) {
      await this.verifySessionOwnership(sessionId, userId);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.reconnectTimer) {
        clearTimeout(session.reconnectTimer);
      }
      // Remove first so the socket's close event is treated as stale and doesn't reconnect
      this.sessions.delete(sessionId);
      const socket = session.socket;
      session.socket = null;
      try {
        void socket?.end(new Error('Session deleted'));
      } catch {
        /* ignore */
      }
    }

    if (this.redis) {
      await this.redis.srem(REDIS_SESSIONS_SET, sessionId);
      await this.redis.del(sessionId);
      await this.redis.del(`session:${sessionId}`);
    }

    // Remove from PostgreSQL
    try {
      await this.prisma.whatsAppSessionRecord.deleteMany({
        where: { sessionId },
      });
    } catch {
      /* ignore */
    }

    this.logger.log(`Session "${sessionId}" deleted.`);
  }

  getConnectedSocket(
    sessionId: string = this.defaultSessionId,
    userId?: string,
  ): WASocket {
    let targetSessionId = sessionId;
    let session = this.sessions.get(targetSessionId);

    // If session not found by exact ID, find the single session for this user
    if (!session && userId) {
      for (const s of this.sessions.values()) {
        if (s.userId === userId && s.status === 'connected') {
          session = s;
          targetSessionId = s.sessionId;
          break;
        }
      }
    }

    if (userId && session?.userId && session.userId !== userId) {
      throw new ForbiddenException(
        `You do not have permission to access session "${sessionId}"`,
      );
    }

    const socket = session?.socket;

    if (!socket?.user || session?.status !== 'connected') {
      throw new ServiceUnavailableException(
        'WhatsApp device is not connected. Please connect your device in the WhatsApp Device tab first.',
      );
    }

    return socket;
  }

  private async syncSessionToDatabase(session: WhatsAppSession) {
    if (!session.userId) return;

    try {
      // Ensure user exists
      await this.prisma.user.upsert({
        where: { id: session.userId },
        update: {},
        create: {
          id: session.userId,
          name: `User ${session.userId.slice(0, 8)}`,
        },
      });

      await this.prisma.whatsAppSessionRecord.upsert({
        where: { sessionId: session.sessionId },
        update: {
          status: session.status,
          phoneNumber: session.phoneNumber,
        },
        create: {
          sessionId: session.sessionId,
          userId: session.userId,
          status: session.status,
          phoneNumber: session.phoneNumber,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to sync session "${session.sessionId}" to database:`, err);
    }
  }

  private toSessionInfo(session: WhatsAppSession): SessionInfo {
    return {
      sessionId: session.sessionId,
      status: session.status,
      qr: session.qr,
      qrRaw: session.qrRaw,
      phoneNumber: session.phoneNumber,
      linking: session.linking,
      qrRefreshing: session.qrRefreshing,
      qrExpired: session.qrExpired,
      lastError: session.lastError,
    };
  }
}
