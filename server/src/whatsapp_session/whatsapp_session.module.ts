import { Module } from '@nestjs/common';
import { WhatsappSessionController } from './whatsapp_session.controller.js';
import { WhatsappSessionService } from './whatsapp_session.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [WhatsappSessionController],
  providers: [WhatsappSessionService],
  exports: [WhatsappSessionService],
})
export class WhatsappSessionModule {}
