import { BadRequestException, Injectable } from '@nestjs/common';
import { WhatsappSessionService } from '../whatsapp_session/whatsapp_session.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createOtpCopyMessage, otpCopyMessageNodes } from './template/template.js';
import { SendOtpDto } from './dto/send-otp.dto.js';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly sessionService: WhatsappSessionService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Sends an OTP code using the specified WhatsApp session
   */
  async sendOtpCode(
    body: SendOtpDto,
    sessionId: string,
    userId: string,
  ): Promise<{ messageId: string; recipientJid: string }> {
    const { phoneNumber, otp } = body;

    const { socket, jid, userId: senderJid } = await this.getRecipient(sessionId, phoneNumber, userId);
    const content = createOtpCopyMessage(otp);

    const { generateWAMessageFromContent, generateMessageIDV2 } =
      await import('baileys');

    const message = generateWAMessageFromContent(jid, content, {
      userJid: senderJid,
      messageId: generateMessageIDV2(senderJid),
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

  /**
   * Sends a plain text message using the specified WhatsApp session
   */
  async sendText(
    phoneNumber: string,
    text: string,
    sessionId: string,
    userId: string,
  ): Promise<{ messageId: string; recipientJid: string }> {
    const { socket, jid } = await this.getRecipient(sessionId, phoneNumber, userId);
    const sent = await socket.sendMessage(jid, { text });

    return {
      messageId: sent!.key.id!,
      recipientJid: jid,
    };
  }

  private async getRecipient(sessionId: string, phoneNumber: string, userId: string) {
    const socket = this.sessionService.getConnectedSocket(sessionId, userId);

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

    return { socket, jid: account.jid, userId: socket.user!.id };
  }

  /**
   * Retrieves message logs for a given user's API keys and WhatsApp sessions
   */
  async getMessageLogs(userId?: string) {
    if (!userId) {
      return [];
    }

    const [userApiKeys, userSessions] = await Promise.all([
      this.prisma.apiKey.findMany({ where: { userId }, select: { key: true } }),
      this.prisma.whatsAppSessionRecord.findMany({ where: { userId }, select: { sessionId: true } }),
    ]);

    const keys = userApiKeys.map((k) => k.key);
    const sessionIds = userSessions.map((s) => s.sessionId);

    if (keys.length === 0 && sessionIds.length === 0) {
      return [];
    }

    return this.prisma.messageLog.findMany({
      where: {
        OR: [
          { apiKey: { in: keys } },
          { sessionId: { in: sessionIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

