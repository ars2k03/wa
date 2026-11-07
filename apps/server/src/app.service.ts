import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  async getStatus() {
    
    return {
      statusCode: HttpStatus.OK,
      success: true,
      service: 'WhatsApp OTP Gateway',
      status: "connected",
      timestamp: new Date().toLocaleString(),
    };
  }
}
