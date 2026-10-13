import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { Redis } from 'ioredis';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import type { WASocket } from 'baileys';
import { ConfigService } from '@nestjs/config';
import { useRedisAuthState } from '../auth/redis-auth-state.js';
import { createOtpCopyMessage, otpCopyMessageNodes } from './template/template.js';

export type WhatsAppConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'qr_ready';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private redis: Redis | null = null;
  private socket: WASocket | null = null;

  private reconnectTimer?: NodeJS.Timeout;
  private destroyed = false;
  private connectionStatus: WhatsAppConnectionStatus = 'disconnected';
  private latestQr: string | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
    
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
      await this.connect();
    } catch (err) {
      this.logger.error('Failed to initialize WhatsApp', err);
    }
  }

  onModuleDestroy() {
    this.destroyed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.socket?.end(new Error('Application shutting down'));
    this.redis?.disconnect();
  }

  private async connect() {
    if (!this.redis) return;

    const {
      default: makeWASocket,
      DisconnectReason,
      fetchLatestBaileysVersion,
    } = await import('baileys');

    this.connectionStatus = 'connecting';

    const { state, saveCreds } = await useRedisAuthState(this.redis);

    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    this.socket = socket;

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', ({ connection, qr, lastDisconnect }) => {
      if (qr) {
        this.latestQr = qr;
        this.connectionStatus = 'qr_ready';
        this.logger.log('Scan this WhatsApp QR code:');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'open') {
        this.connectionStatus = 'connected';
        this.latestQr = null;
        this.logger.log('WhatsApp connected successfully');
      }

      if (connection === 'close') {
        this.socket = null;
        this.connectionStatus = 'disconnected';

        const statusCode = (
          lastDisconnect?.error as {
            output?: { statusCode?: number };
          }
        )?.output?.statusCode;

        this.logger.warn(
          `WhatsApp disconnected (statusCode: ${statusCode ?? 'unknown'})`,
        );

        if (statusCode !== DisconnectReason.loggedOut && !this.destroyed) {
          this.reconnectTimer = setTimeout(() => void this.connect(), 3000);
        } else {
          this.logger.error(
            'WhatsApp session logged out. Needs fresh QR scan.',
          );
        }
      }
    });
  }

  getConnectionStatus(): WhatsAppConnectionStatus {
    return this.connectionStatus;
  }

  async sendOtpCode(params: {
    phoneNumber: string;
    otp: string;
  }): Promise<{ messageId: string; recipientJid: string }> {
    const { phoneNumber, otp } = params;

    if (!otp?.trim()) {
      throw new BadRequestException('OTP code is required');
    }

    const { socket, jid, userId } = await this.getRecipient(phoneNumber);
    const content = createOtpCopyMessage(otp);

    const { generateWAMessageFromContent, generateMessageIDV2 } = await import('baileys');

    const message = generateWAMessageFromContent(jid, content, {
      userJid: userId,
      messageId: generateMessageIDV2(userId),
    });

    await socket.relayMessage(jid, message.message!, {
      messageId: message.key.id!,
      additionalNodes: otpCopyMessageNodes(),
    });

    return {
      messageId: message.key.id!,
      recipientJid: jid,
    };
  }


  private async getRecipient(phoneNumber: string) {
    const socket = this.socket;

    if (!socket?.user) {
      throw new ServiceUnavailableException(
        'WhatsApp service is not connected. Please connect WhatsApp first.',
      );
    }

    let number = phoneNumber.replace(/\D/g, '');

    // Bangladesh standard formatting: 01XXXXXXXXX -> 8801XXXXXXXXX
    if (number.startsWith('0')) {
      number = `880${number.slice(1)}`;
    }

    if (!/^\d{10,15}$/.test(number)) {
      throw new BadRequestException(
        'Invalid phone number. Ensure valid country code without special characters.',
      );
    }

    const [account] = (await socket.onWhatsApp(number)) ?? [];

    if (!account?.exists) {
      throw new BadRequestException(
        `Number ${number} is not registered on WhatsApp.`,
      );
    }

    return { socket, jid: account.jid, userId: socket.user.id };
  }
}
