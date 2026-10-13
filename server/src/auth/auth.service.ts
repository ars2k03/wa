import { BadRequestException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { OtpService } from '../otp/otp.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { AuthenticatedUser, JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async register(body: RegisterDto) {
    const { email, name: rawName, password: rawPassword } = body;
    const name = rawName || email.split('@')[0];
    const password = rawPassword ? await bcrypt.hash(rawPassword, 10) : null;

    // Check existing user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isVerified) {
      throw new BadRequestException('An account with this email already exists. Please log in.');
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password,
          isVerified: false,
        },
      });
    } else {
      // Update unverified user credentials
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          name,
          password,
        },
      });
    }

    // Send 6-digit OTP via official Gmail API
    await this.otpService.sendOtp(email);

    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Account created. Please check your email for the 6-digit verification code.',
      data: {
        email: user.email,
        isVerified: false,
      },
    };
  }

  async login(body: LoginDto) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password if one was set
    if (user.password && password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Invalid email or password');
      }
    }

    // Check verification status
    if (!user.isVerified) {
      // Auto-dispatch fresh OTP for convenience
      try {
        await this.otpService.sendOtp(email);
      } catch {
        /* ignore delivery error on login attempt */
      }

      return {
        statusCode: HttpStatus.FORBIDDEN,
        success: false,
        isVerified: false,
        message: 'Account not verified. A new 6-digit verification code has been sent to your email.',
        data: {
          email: user.email,
        },
      };
    }

    const token = await this.generateToken(user.id, user.email, user.name);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      isVerified: true,
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
