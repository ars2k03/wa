import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { WhatsappSessionService } from '../whatsapp_session/whatsapp_session.service.js';
import {
  createOtpCopyMessage,
  otpCopyMessageNodes,
} from './template/template.js';

@Injectable()
export class WhatsappService {
  constructor(private readonly sessionService: WhatsappSessionService) {}

  /**
   * Sends an OTP code using the specified WhatsApp session
   */
  async sendOtpCode(params: {
    sessionId?: string;
    phoneNumber: string;
    otp: string;
  }): Promise<{ messageId: string; recipientJid: string; senderSession: string }> {
    const { sessionId = 'default', phoneNumber, otp } = params;

    if (!otp?.trim()) {
      throw new BadRequestException('OTP code is required');
    }

    const { socket, jid, userId } = await this.getRecipient(sessionId, phoneNumber);
    const content = createOtpCopyMessage(otp);

    const { generateWAMessageFromContent, generateMessageIDV2 } =
      await import('baileys');

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
      senderSession: sessionId,
    };
  }

  private async getRecipient(sessionId: string, phoneNumber: string) {
    const socket = this.sessionService.getConnectedSocket(sessionId);

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
}
