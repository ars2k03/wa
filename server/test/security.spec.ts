import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { WhatsappSessionService } from '../src/whatsapp_session/whatsapp_session.service.js';
import { ApiKeyService } from '../src/api_key/api_key.service.js';
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

  describe('ApiKeyService Session Hijacking Prevention', () => {
    let apiKeyService: ApiKeyService;
    let prismaMock: any;

    beforeEach(() => {
      prismaMock = {
        apiKey: {
          create: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
        },
        whatsAppSessionRecord: {
          findUnique: vi.fn(),
        },
        user: {
          upsert: vi.fn(),
        },
      };
      apiKeyService = new ApiKeyService(prismaMock);
    });

    it('prevents linking another user session to an API key', async () => {
      prismaMock.apiKey.findUnique.mockResolvedValue({
        id: 'key_1',
        key: '_ars_2k03_abc',
        userId: 'attacker_user',
      });

      prismaMock.whatsAppSessionRecord.findUnique.mockResolvedValue({
        sessionId: 'victim_session',
        userId: 'victim_user',
      });

      await expect(
        apiKeyService.linkSessionToKey(
          'key_1',
          { sessionId: 'victim_session' },
          'attacker_user',
        ),
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
          if (key === 'GMAIL_CLIENT_ID') return 'mock_client_id';
          if (key === 'GMAIL_CLIENT_SECRET') return 'mock_client_secret';
          if (key === 'GMAIL_REFRESH_TOKEN') return 'mock_refresh_token';
          if (key === 'GMAIL_USER') return 'test@example.com';
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
