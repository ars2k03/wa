import { Module } from '@nestjs/common';
import { OtpTemplateService } from './otp_template.service.js';
import { OtpTemplateController } from './otp_template.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [OtpTemplateController],
  providers: [OtpTemplateService],
  exports: [OtpTemplateService],
})
export class OtpTemplateModule {}
