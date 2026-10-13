import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('send-otp')
  async sendOtp(@Body() body: SendOtpDto) {
    const result = await this.whatsappService.sendOtpCode({
      phoneNumber: body.phoneNumber,
      otp: body.otp,
    });

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'OTP sent successfully',
      data: result,
    };
  }
}
