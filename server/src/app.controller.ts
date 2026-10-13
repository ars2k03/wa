import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  index() {
    return this.appService.getStatus();
  }

  @Post('auth/register')
  async register(
    @Body() body: { name?: string; email: string; password?: string },
  ) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    const email = body.email.trim().toLowerCase();
    const name = body.name?.trim() || email.split('@')[0];

    // Find existing or create new
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }

    const token = `usr_tok_${Buffer.from(user.id).toString('base64')}`;

    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Account registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    };
  }

  @Post('auth/login')
  async login(@Body() body: { email: string; password?: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    const email = body.email.trim().toLowerCase();

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto-create for seamless onboarding
      user = await this.prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
        },
      });
    }

    const token = `usr_tok_${Buffer.from(user.id).toString('base64')}`;

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    };
  }

  @Get('auth/me')
  async me(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      return {
        statusCode: HttpStatus.OK,
        success: true,
        data: null,
      };
    }

    const rawToken = authHeader.replace('Bearer ', '').trim();
    if (rawToken.startsWith('usr_tok_')) {
      try {
        const userId = Buffer.from(rawToken.replace('usr_tok_', ''), 'base64').toString('utf8');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          return {
            statusCode: HttpStatus.OK,
            success: true,
            data: { id: user.id, name: user.name, email: user.email },
          };
        }
      } catch {}
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: null,
    };
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

