import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service.js';
import { WhatsappController } from './whatsapp.controller.js';
import { WhatsappSessionModule } from '../whatsapp_session/whatsapp_session.module.js';
import { ApiKeyModule } from '../api_key/api_key.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OtpTemplateModule } from '../otp_template/otp_template.module.js';

@Module({
  imports: [WhatsappSessionModule, ApiKeyModule, AuthModule, PrismaModule, OtpTemplateModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
