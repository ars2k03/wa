import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { AuthenticatedUser, JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDto) {
    if (!body?.email) {
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

    const token = await this.generateToken(user.id, user.email, user.name);

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

  async login(body: LoginDto) {
    if (!body?.email) {
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

    const token = await this.generateToken(user.id, user.email, user.name);

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

  async getMe(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async validateToken(rawToken: string): Promise<AuthenticatedUser> {
    if (!rawToken) {
      throw new UnauthorizedException('Token is required');
    }

    const cleanToken = rawToken.replace(/^Bearer\s+/i, '').trim();

    // 1. Check legacy base64 token format ("usr_tok_<base64>") for seamless backward compatibility
    if (cleanToken.startsWith('usr_tok_')) {
      try {
        const userId = Buffer.from(
          cleanToken.replace('usr_tok_', ''),
          'base64',
        ).toString('utf8');

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }
      } catch {
        throw new UnauthorizedException('Invalid legacy token format');
      }
    }

    // 2. Validate standard signed JWT
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(cleanToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  private async generateToken(
    userId: string,
    email: string | null,
    name: string | null,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      name,
    };

    return this.jwtService.signAsync(payload);
  }
}
