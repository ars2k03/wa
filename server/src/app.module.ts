import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { WhatsappModule } from './whatsapp/whatsapp.module.js';
import { WhatsappSessionModule } from './whatsapp_session/whatsapp_session.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ApiKeyModule } from './api_key/api_key.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OtpModule } from './otp/otp.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 30,
      },
    ]),
    PrismaModule,
    AuthModule,
    OtpModule,
    ApiKeyModule,
    WhatsappSessionModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
