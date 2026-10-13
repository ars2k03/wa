import { HttpStatus, Injectable } from '@nestjs/common';
import { WhatsappService } from './whatsapp/whatsapp.service.js';

@Injectable()
export class AppService {
  constructor(private readonly whatsappService: WhatsappService) {}

  getStatus() {
    return {
      statusCode: HttpStatus.OK,
      success: true,
      service: 'WhatsApp OTP Gateway',
      status: this.whatsappService.getConnectionStatus(),
      timestamp: new Date().toLocaleString(),
    };
  }
}
