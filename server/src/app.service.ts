import { HttpStatus, Injectable } from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp_session/whatsapp_session.service.js';

@Injectable()
export class AppService {
  constructor(private readonly sessionService: WhatsappSessionService) {}

  async getStatus() {
    const sessionInfo = await this.sessionService.getSessionStatus();
    return {
      statusCode: HttpStatus.OK,
      success: true,
      service: 'WhatsApp OTP Gateway',
      status: sessionInfo.status,
      timestamp: new Date().toLocaleString(),
    };
  }
}
