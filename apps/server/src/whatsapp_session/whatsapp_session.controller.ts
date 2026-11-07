import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp_session.service.js';
import { InitSessionDto } from './dto/init-session.dto.js';
import { AuthGuard, type AuthenticatedRequest } from '../auth/guards/auth.guard.js';

@Controller('sessions')
@UseGuards(AuthGuard)
export class WhatsappSessionController {
  constructor(private readonly sessionService: WhatsappSessionService) {}

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
