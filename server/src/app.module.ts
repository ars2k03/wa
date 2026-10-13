import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { WhatsappSessionModule } from './whatsapp_session/whatsapp_session.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WhatsappSessionModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
