import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { WhatsappSessionService } from '../src/whatsapp_session/whatsapp_session.service.js';
import { OtpService } from '../src/otp/otp.service.js';

describe('Security Hardening Specs', () => {
  describe('WhatsappSessionService IDOR Prevention', () => {
    let sessionService: WhatsappSessionService;
    let configMock: any;
    let prismaMock: any;

    beforeEach(() => {
      configMock = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'WHATSAPP_SESSION_NAME') return 'default';
          if (key === 'REDIS_URL') return 'redis://localhost:6379';
          return null;
        }),
      };
      prismaMock = {
        whatsAppSessionRecord: {
          findUnique: vi.fn(),
          findMany: vi.fn(),
          deleteMany: vi.fn(),
          upsert: vi.fn(),
        },
        user: {
          upsert: vi.fn(),
        },
      };
      sessionService = new WhatsappSessionService(configMock, prismaMock);
    });

    it('rejects accessing session belonging to another user', async () => {
      prismaMock.whatsAppSessionRecord.findUnique.mockResolvedValue({
        sessionId: 'session_123',
        userId: 'victim_user',
      });

      await expect(
        sessionService.verifySessionOwnership('session_123', 'attacker_user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows accessing session when the user is the owner', async () => {
      prismaMock.whatsAppSessionRecord.findUnique.mockResolvedValue({
        sessionId: 'session_123',
        userId: 'owner_user',
      });

      await expect(
        sessionService.verifySessionOwnership('session_123', 'owner_user'),
      ).resolves.toBeUndefined();
    });

    it('rejects deleting another user session', async () => {
      prismaMock.whatsAppSessionRecord.findUnique.mockResolvedValue({
        sessionId: 'session_123',
        userId: 'victim_user',
      });

      await expect(
        sessionService.deleteSession('session_123', 'attacker_user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('OtpService Brute-Force Rate Limiting', () => {
    let otpService: OtpService;
    let prismaMock: any;
    let configMock: any;

    beforeEach(() => {
      prismaMock = {
        user: {
          findUnique: vi.fn(),
          update: vi.fn(),
        },
      };
      configMock = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'RESEND_API_KEY') return 're_mock_key';
          if (key === 'MAIL_FROM') return 'Test <test@example.com>';
          return null;
        }),
      };
      otpService = new OtpService(prismaMock, configMock);
    });

    it('blocks and invalidates OTP after 5 failed attempts', async () => {
      const email = 'user@example.com';
      prismaMock.user.findUnique.mockResolvedValue({
        email,
        otpCode: 'hashed_secret_code',
        otpExpiresAt: new Date(Date.now() + 60000),
      });

      // 4 wrong attempts
      for (let i = 0; i < 4; i++) {
        await expect(
          otpService.verifyOtp({ email, otp: '000000' }),
        ).rejects.toThrow(BadRequestException);
      }

      // 5th wrong attempt triggers invalidation
      await expect(
        otpService.verifyOtp({ email, otp: '000000' }),
      ).rejects.toThrow('Too many failed verification attempts');

      // Verifies OTP was invalidated in DB
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { email },
        data: { otpCode: null, otpExpiresAt: null },
      });
    });
  });
});
