import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module.js';
import { OtpController } from './otp.controller.js';
import { OtpService } from './otp.service.js';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
