import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp_session.service.js';
import { InitSessionDto } from './dto/init-session.dto.js';
import { PairingCodeDto } from './dto/pairing-code.dto.js';
import { AuthGuard, type AuthenticatedRequest } from '../auth/guards/auth.guard.js';

@Controller('sessions')
@UseGuards(AuthGuard)
export class WhatsappSessionController {
  constructor(private readonly sessionService: WhatsappSessionService) {}

  @Get()
  async getAllSessions(@Req() req: AuthenticatedRequest) {
    const sessions = await this.sessionService.getAllSessions(req.user?.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: sessions,
    };
  }

  @Post(':sessionId/init')
  async initSession(
    @Param('sessionId') sessionId: string,
    @Body() body: InitSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.id) {
      body.userId = req.user.id;
    }
    const session = await this.sessionService.initSession(sessionId, body);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Session initialization triggered',
      data: session,
    };
  }

  @Get(':sessionId/status')
  async getSessionStatus(
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const status = await this.sessionService.getSessionStatus(sessionId, req.user?.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: status,
    };
  }

  @Post(':sessionId/pairing-code')
  async requestPairingCode(
    @Param('sessionId') sessionId: string,
    @Body() body: PairingCodeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const code = await this.sessionService.requestPairingCode(sessionId, body, req.user?.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Pairing code generated',
      data: {
        sessionId,
        pairingCode: code,
      },
    };
  }

  @Delete(':sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.sessionService.deleteSession(sessionId, req.user?.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Session "${sessionId}" deleted successfully`,
    };
  }
}
