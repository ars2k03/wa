import { HttpStatus, Injectable } from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp_session/whatsapp_session.service.js';

@Injectable()
export class AppService {
  constructor(private readonly sessionService: WhatsappSessionService) {}

  getStatus() {
    return {
      statusCode: HttpStatus.OK,
      success: true,
      service: 'WhatsApp OTP Gateway',
      status: this.sessionService.getSessionStatus().status,
      timestamp: new Date().toLocaleString(),
    };
  }
}
