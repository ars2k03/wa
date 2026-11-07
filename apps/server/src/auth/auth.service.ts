import { BadRequestException, ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new BadRequestException('An account with this email already exists. Please log in.');
      }
      throw new BadRequestException(
        'An account with this email has already been registered but is not verified. Please log in to complete verification.',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password,
        isVerified: false,
      },
    });

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

    if (!user.password || !password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check verification status
    if (!user.isVerified) {
      // Auto-dispatch fresh OTP for convenience
      try {
        await this.otpService.sendOtp(email);
      } catch {
        /* ignore delivery error on login attempt */
      }

      throw new ForbiddenException({
        statusCode: HttpStatus.FORBIDDEN,
        success: false,
        isVerified: false,
        message: 'Account not verified. A new 6-digit verification code has been sent to your email.',
        data: {
          email: user.email,
        },
      });
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

    // Validate standard signed cryptographic JWT
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
