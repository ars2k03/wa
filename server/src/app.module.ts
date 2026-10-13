import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { WhatsappSessionModule } from './whatsapp_session/whatsapp_session.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ApiKeyModule } from './api_key/api_key.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ApiKeyModule,
    WhatsappSessionModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
