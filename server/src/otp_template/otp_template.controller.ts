import { Body, Controller, Delete, Get, HttpStatus, Put, Req, UseGuards } from '@nestjs/common';
import { OtpTemplateService } from './otp_template.service.js';
import { SaveOtpTemplateDto } from './dto/save-otp-template.dto.js';
import { DEFAULT_OTP_TEMPLATE } from './otp_template.constants.js';
import { AuthGuard, type AuthenticatedRequest } from '../auth/guards/auth.guard.js';

@Controller('otp-template')
@UseGuards(AuthGuard)
export class OtpTemplateController {
  constructor(private readonly otpTemplateService: OtpTemplateService) {}

  @Get()
  async getTemplate(@Req() req: AuthenticatedRequest) {
    const template = await this.otpTemplateService.getTemplate(req.user!.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: { template, defaultTemplate: DEFAULT_OTP_TEMPLATE },
    };
  }

  @Put()
  async saveTemplate(
    @Body() body: SaveOtpTemplateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const template = await this.otpTemplateService.saveTemplate(req.user!.id, body);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'OTP template saved successfully',
      data: template,
    };
  }

  @Delete()
  async deleteTemplate(@Req() req: AuthenticatedRequest) {
    const result = await this.otpTemplateService.deleteTemplate(req.user!.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'OTP template reset to default',
      data: result,
    };
  }
}
