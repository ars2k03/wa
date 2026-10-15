import { Body, Controller, Get, HttpStatus, Post, Req, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { SendOtpDto } from './dto/send-otp.dto.js';
import { SendTemplateDto } from './dto/send-template.dto.js';
import { ApiKeyGuard, type AuthenticatedRequest as AuthenticatedApiKeyRequest } from '../api_key/guards/api-key.guard.js';
import { AuthGuard, type AuthenticatedRequest as AuthenticatedUserRequest } from '../auth/guards/auth.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TemplateService } from '../template/template.service.js';

@Controller()
export class WhatsappController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly prisma: PrismaService,
    private readonly templateService: TemplateService,
  ) {}

  @Post('send-otp')
  @UseGuards(ApiKeyGuard)
  async sendOtp(
    @Body() body: SendOtpDto,
    @Req() req: AuthenticatedApiKeyRequest,
  ) {
    const userId = req.apiKeyRecord!.userId;
    const targetSessionId = await this.getConnectedSessionId(userId);
    const result = await this.whatsappService.sendOtpCode(body, targetSessionId, userId);

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

  @Post('send-template')
  @UseGuards(ApiKeyGuard)
  async sendTemplate(
    @Body() body: SendTemplateDto,
    @Req() req: AuthenticatedApiKeyRequest,
  ) {
    const userId = req.apiKeyRecord!.userId;
    // Render before touching WhatsApp so bad input fails fast with a clear error
    const template = await this.templateService.getTemplate(body.templateId, userId);
    const text = this.templateService.renderTemplate(template.body, body.variables);
    const targetSessionId = await this.getConnectedSessionId(userId);

    const result = await this.whatsappService.sendText(body.phoneNumber, text, targetSessionId, userId);

    // Audit log in database
    void this.prisma.messageLog
      .create({
        data: {
          sessionId: targetSessionId,
          apiKey: req.apiKeyRecord?.key ?? null,
          recipient: body.phoneNumber,
          messageType: 'template',
          messageId: result.messageId,
          templateId: template.id,
          templateName: template.name,
          status: 'sent',
        },
      })
      .catch(() => {});

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Template message sent successfully',
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
