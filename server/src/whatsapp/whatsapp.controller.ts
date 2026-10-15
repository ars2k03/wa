import { Body, Controller, Get, HttpStatus, Post, Req, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { ApiKeyGuard, type AuthenticatedRequest as AuthenticatedApiKeyRequest } from '../api_key/guards/api-key.guard.js';
import { AuthGuard, type AuthenticatedRequest as AuthenticatedUserRequest } from '../auth/guards/auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsageService } from '../usage/usage.service.js';

@Controller()
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
    private readonly usageService: UsageService,
  ) {}

  @Post('send-otp')
  @UseGuards(ApiKeyGuard)
  async sendOtp(
    @Body() body: SendOtpDto,
    @Req() req: AuthenticatedApiKeyRequest,
  ) {
    const userId = req.apiKeyRecord!.userId;
    const targetSessionId = await this.getConnectedSessionId(userId);

    // Count against the user's daily/monthly quota first; throws 429 when a limit is full
    const usagePeriods = await this.usageService.reserve(userId);
    let result: Awaited<ReturnType<WhatsappService['sendOtpCode']>>;
    try {
      result = await this.whatsappService.sendOtpCode(body, targetSessionId, userId);
    } catch (err) {
      // Only successful sends count, so give the slot back
      await this.usageService.release(userId, usagePeriods).catch(() => {});
      throw err;
    }

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
  @UseGuards(AuthGuard)
  async getMessageLogs(@Req() req: AuthenticatedUserRequest) {
    const logs = await this.whatsappService.getMessageLogs(req.user?.id);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: logs,
    };
  }

  /**
   * One account = one WhatsApp device: always send through the API key owner's own session.
   */
  private async getConnectedSessionId(userId: string): Promise<string> {
    const userSession = await this.prisma.whatsAppSessionRecord.findFirst({
      where: { userId, status: 'connected' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!userSession) {
      throw new ServiceUnavailableException(
        'WhatsApp device is not connected. Please connect your device in the WhatsApp Device tab first.',
      );
    }

    return userSession.sessionId;
  }
}
