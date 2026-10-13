import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { WhatsappController } from './whatsapp.controller.js';
import { WhatsappSessionModule } from '../whatsapp_session/whatsapp_session.module.js';

@Module({
  imports: [WhatsappSessionModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
