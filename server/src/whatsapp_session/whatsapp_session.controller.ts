import { Body, Controller, Delete, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp_session.service.js';
import { InitSessionDto } from './dto/init-session.dto.js';
import { PairingCodeDto } from './dto/pairing-code.dto.js';

@Controller('sessions')
export class WhatsappSessionController {
  constructor(private readonly sessionService: WhatsappSessionService) {}

  @Get()
  getAllSessions() {
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: this.sessionService.getAllSessions(),
    };
  }

  @Post(':sessionId/init')
  async initSession(
    @Param('sessionId') sessionId: string,
    @Body() body: InitSessionDto,
  ) {
    const session = await this.sessionService.initSession(sessionId, body);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Session initialization triggered',
      data: session,
    };
  }

  @Get(':sessionId/status')
  getSessionStatus(@Param('sessionId') sessionId: string) {
    const status = this.sessionService.getSessionStatus(sessionId);
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
  ) {
    const code = await this.sessionService.requestPairingCode(sessionId, body);
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
  async deleteSession(@Param('sessionId') sessionId: string) {
    await this.sessionService.deleteSession(sessionId);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Session "${sessionId}" deleted successfully`,
    };
  }
}
