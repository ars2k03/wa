import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import QRCode from 'qrcode';
import pino from 'pino';
import type { WASocket } from 'baileys';
import { ConfigService } from '@nestjs/config';
import { useRedisAuthState } from '../auth/redis-auth-state.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
}

export interface SessionInfo {
  sessionId: string;
  status: WhatsAppConnectionStatus;
  qr: string | null; // Base64 data URL (e.g. data:image/png;base64,...) for direct <img> display
  qrRaw: string | null; // Raw string for React QR components
  phoneNumber: string | null;
}

const REDIS_SESSIONS_SET = 'whatsapp:active_sessions';

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
    this.defaultSessionId =
      this.config.get<string>('WHATSAPP_SESSION_NAME') || 'default';

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
      session.socket?.end(new Error('Application shutting down'));
    }
    this.sessions.clear();
    this.redis?.disconnect();
  }

  private async restorePersistedSessions() {
    if (!this.redis) return;

    const savedSessions = await this.redis.smembers(REDIS_SESSIONS_SET);

    if (!savedSessions.includes(this.defaultSessionId)) {
      savedSessions.push(this.defaultSessionId);
    }

    this.logger.log(
      `Restoring ${savedSessions.length} session(s): ${savedSessions.join(', ')}`,
    );

    for (const sessionId of savedSessions) {
      void this.initSession(sessionId).catch((err) => {
        this.logger.error(`Error restoring session "${sessionId}":`, err);
      });
    }
  }

  /**
   * Initializes or gets a session, generating QR code for the frontend
   */
  async initSession(
    sessionId: string = this.defaultSessionId,
    userId?: string,
  ): Promise<SessionInfo> {
    const existing = this.sessions.get(sessionId);
    if (
      existing &&
      (existing.status === 'connected' || existing.status === 'connecting')
    ) {
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
    };
    if (userId) {
      session.userId = userId;
    }
    this.sessions.set(sessionId, session);

    // Sync initialization to PostgreSQL
    if (session.userId) {
      await this.syncSessionToDatabase(session);
    }

    await this.connectSession(session);
    return this.toSessionInfo(session);
  }

  private async connectSession(session: WhatsAppSession) {
    if (!this.redis || this.destroyed) return;

    const {
      default: makeWASocket,
      DisconnectReason,
      fetchLatestBaileysVersion,
    } = await import('baileys');

    session.status = 'connecting';

    const redisSessionKey = `session:${session.sessionId}`;
    const { state, saveCreds } = await useRedisAuthState(
      this.redis,
      redisSessionKey,
    );

    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    session.socket = socket;

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', async ({ connection, qr, lastDisconnect }) => {
      if (qr) {
        try {
          // Generate high quality base64 image data URL for frontend <img>
          const dataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            width: 320,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          });
          session.qr = dataUrl;
          session.qrRaw = qr;
        } catch {
          session.qr = null;
          session.qrRaw = qr;
        }

        session.status = 'qr_ready';
        this.logger.log(`[Session: ${session.sessionId}] WhatsApp QR code generated for frontend.`);
      }

      if (connection === 'open') {
        session.status = 'connected';
        session.qr = null;
        session.qrRaw = null;
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
        session.status = 'disconnected';

        const statusCode = (
          lastDisconnect?.error as {
            output?: { statusCode?: number };
          }
        )?.output?.statusCode;

        this.logger.warn(
          `[Session: ${session.sessionId}] WhatsApp disconnected (statusCode: ${statusCode ?? 'unknown'})`,
        );

        if (statusCode === DisconnectReason.loggedOut) {
          this.logger.error(
            `[Session: ${session.sessionId}] WhatsApp session logged out. Needs fresh QR scan.`,
          );
          void this.redis?.srem(REDIS_SESSIONS_SET, session.sessionId);
        } else if (!this.destroyed) {
          session.reconnectTimer = setTimeout(() => {
            void this.connectSession(session);
          }, 3000);
        }

        // Update disconnected state in PostgreSQL
        await this.syncSessionToDatabase(session);
      }
    });
  }

  /**
   * Request pairing code for phone-number based linking (without camera scan)
   */
  async requestPairingCode(sessionId: string, phoneNumber: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.socket) {
      throw new BadRequestException(
        `Session "${sessionId}" is not initialized. Please call /sessions/:sessionId/init first.`,
      );
    }

    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = `880${cleanNumber.slice(1)}`;
    }

    try {
      const code = await session.socket.requestPairingCode(cleanNumber);
      return code;
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to request pairing code: ${err?.message || 'Unknown error'}`,
      );
    }
  }

  getSessionStatus(sessionId: string = this.defaultSessionId): SessionInfo {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        sessionId,
        status: 'disconnected',
        qr: null,
        qrRaw: null,
        phoneNumber: null,
      };
    }
    return this.toSessionInfo(session);
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).map((s) =>
      this.toSessionInfo(s),
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.reconnectTimer) {
        clearTimeout(session.reconnectTimer);
      }
      try {
        session.socket?.end(new Error('Session deleted'));
      } catch {
        /* ignore */
      }
      this.sessions.delete(sessionId);
    }

    if (this.redis) {
      await this.redis.srem(REDIS_SESSIONS_SET, sessionId);
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

  getConnectedSocket(sessionId: string = this.defaultSessionId): WASocket {
    const session = this.sessions.get(sessionId);
    const socket = session?.socket;

    if (!socket?.user || session?.status !== 'connected') {
      throw new ServiceUnavailableException(
        `WhatsApp session "${sessionId}" is not connected. Please scan QR first.`,
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
    };
  }
}
