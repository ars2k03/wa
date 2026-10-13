import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { WhatsappSessionService } from './whatsapp_session.service.js';

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
  async initSession(@Param('sessionId') sessionId: string) {
    const session = await this.sessionService.initSession(sessionId);
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
