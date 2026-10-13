import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { OtpService } from './otp.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async sendOtp(@Body() body: SendOtpDto) {
    const result = await this.otpService.sendOtp(body.email);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: result.message,
    };
  }

  @Post('verify')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const result = await this.otpService.verifyOtp(body.email, body.otp);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: result.message,
    };
  }
}
