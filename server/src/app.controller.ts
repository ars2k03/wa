import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async index() {
    return this.appService.getStatus();
  }

  @Get('stats')
  async getStats() {
    const [userCount, keyCount, logCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.apiKey.count({ where: { isActive: true } }),
      this.prisma.messageLog.count(),
    ]);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: {
        activeKeys: keyCount,
        registeredUsers: userCount,
        dispatchedMessages: logCount,
      },
    };
  }
}

