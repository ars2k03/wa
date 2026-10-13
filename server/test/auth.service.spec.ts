import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/auth/auth.service.js';
import { UnauthorizedException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from '../src/auth/dto/register.dto.js';
import { LoginDto } from '../src/auth/dto/login.dto.js';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtMock: any;
  let otpMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    jwtMock = {
      signAsync: vi.fn().mockResolvedValue('mock_jwt_token_123'),
      verifyAsync: vi.fn(),
    };

    otpMock = {
      sendOtp: vi.fn().mockResolvedValue({ success: true, message: 'OTP sent' }),
      verifyOtp: vi.fn().mockResolvedValue({ success: true, message: 'Verified' }),
    };

    authService = new AuthService(prismaMock, jwtMock, otpMock);
  });

  describe('register', () => {
    it('fails DTO validation if email is invalid or missing', async () => {
      const dto = plainToInstance(RegisterDto, { email: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('creates a new user and triggers OTP dispatch', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user_1',
        email: 'test@example.com',
        name: 'test',
        isVerified: false,
      });

      const result = await authService.register({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data.email).toBe('test@example.com');
      expect(otpMock.sendOtp).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('fails DTO validation if email is invalid or missing', async () => {
      const dto = plainToInstance(LoginDto, { email: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('throws UnauthorizedException if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(
        authService.login({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns token for verified user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_1',
        email: 'existing@example.com',
        name: 'Existing User',
        isVerified: true,
      });

      const result = await authService.login({
        email: 'existing@example.com',
      });

      expect(result.success).toBe(true);
      expect((result.data as any)?.user?.name).toBe('Existing User');
      expect((result.data as any)?.token).toBe('mock_jwt_token_123');
    });
  });

  describe('validateToken', () => {
    it('validates legacy usr_tok_ tokens', async () => {
      const rawToken = `usr_tok_${Buffer.from('legacy_id').toString('base64')}`;
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'legacy_id',
        email: 'legacy@example.com',
        name: 'Legacy User',
      });

      const user = await authService.validateToken(rawToken);
      expect(user.id).toBe('legacy_id');
    });

    it('validates standard JWT token', async () => {
      jwtMock.verifyAsync.mockResolvedValue({
        sub: 'user_jwt_123',
        email: 'jwt@example.com',
      });
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_jwt_123',
        email: 'jwt@example.com',
        name: 'JWT User',
      });

      const user = await authService.validateToken('valid_jwt_token');
      expect(user.id).toBe('user_jwt_123');
      expect(user.email).toBe('jwt@example.com');
    });

    it('throws UnauthorizedException if token is missing', async () => {
      await expect(authService.validateToken('')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
