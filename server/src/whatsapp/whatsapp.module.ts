import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { WhatsappController } from './whatsapp.controller.js';
import { WhatsappSessionModule } from '../whatsapp_session/whatsapp_session.module.js';
import { ApiKeyModule } from '../api_key/api_key.module.js';

@Module({
  imports: [WhatsappSessionModule, ApiKeyModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
