import { BadRequestException, Injectable } from '@nestjs/common';
import { WhatsappSessionService } from '../whatsapp_session/whatsapp_session.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { createOtpMessage, otpCopyMessageNodes } from './template/template.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { OtpTemplateService } from '../otp_template/otp_template.service.js';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly sessionService: WhatsappSessionService,
    private readonly prisma: PrismaService,
    private readonly otpTemplateService: OtpTemplateService,
  ) {}

  /**
   * Sends an OTP code using the specified WhatsApp session, formatted with the user's OTP template
   */
  async sendOtpCode(
    body: SendOtpDto,
    sessionId: string,
    userId: string,
  ): Promise<{ messageId: string; recipientJid: string }> {
    const { phoneNumber, otp } = body;

    const [{ socket, jid, userId: senderJid }, template] = await Promise.all([
      this.getRecipient(sessionId, phoneNumber, userId),
      this.otpTemplateService.getEffectiveTemplate(userId),
    ]);
    const content = createOtpMessage(otp, template);

    const { generateWAMessageFromContent, generateMessageIDV2 } =
      await import('baileys');

    const message = generateWAMessageFromContent(jid, content, {
      userJid: senderJid,
      messageId: generateMessageIDV2(senderJid),
    });

    await socket.relayMessage(jid, message.message!, {
      messageId: message.key.id!,
      // The biz node is only needed for the interactive (copy button) variant
      ...(template.showCopyButton && { additionalNodes: otpCopyMessageNodes() }),
    });

    return {
      messageId: message.key.id!,
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
      this.prisma.apiKey.findMany({ where: { userId }, select: { id: true } }),
      this.prisma.whatsAppSessionRecord.findMany({ where: { userId }, select: { sessionId: true } }),
    ]);

    const keyIds = userApiKeys.map((k) => k.id);
    const sessionIds = userSessions.map((s) => s.sessionId);

    if (keyIds.length === 0 && sessionIds.length === 0) {
      return [];
    }

    return this.prisma.messageLog.findMany({
      where: {
        OR: [
          { apiKeyId: { in: keyIds } },
          { sessionId: { in: sessionIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

