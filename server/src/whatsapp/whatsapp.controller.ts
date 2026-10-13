import { Body, Controller, Get, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { ApiKeyGuard, type AuthenticatedRequest } from '../api_key/guards/api-key.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller()
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('send-otp')
  @UseGuards(ApiKeyGuard)
  async sendOtp(
    @Body() body: SendOtpDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const targetSessionId = req.sessionId || body.sessionId || 'default';

    const result = await this.whatsappService.sendOtpCode(body, req.sessionId);

    // Audit log in database
    void this.prisma.messageLog
      .create({
        data: {
          sessionId: targetSessionId,
          apiKey: req.apiKeyRecord?.key ?? null,
          recipient: body.phoneNumber,
          messageType: 'otp',
          messageId: result.messageId,
          status: 'sent',
        },
      })
      .catch(() => {});

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'OTP sent successfully',
      data: result,
    };
  }

  @Get('message-logs')
  async getMessageLogs(@Req() _req: any) {
    const logs = await this.prisma.messageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: logs,
    };
  }
}
