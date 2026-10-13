import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { LinkSessionDto } from './dto/link-session.dto.js';

export interface CachedApiKey {
  id: string;
  key: string;
  userId: string;
  sessionId: string | null;
  isActive: boolean;
  cachedAt: number;
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  private readonly memoryCache = new Map<string, CachedApiKey>();
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute memory cache

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a new cryptographically secure API Key
   */
  async createApiKey(body: CreateApiKeyDto) {
    const { userId, name = 'Default Key', sessionId } = body;

    // Ensure the user exists in database, or create a default user record
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: `User ${userId.slice(0, 8)}`,
      },
    });

    // Generate secure key: _ars_2k03_<48 random hex characters>
    const randomHex = randomBytes(24).toString('hex');
    const key = `_ars_2k03_${randomHex}`;

    const record = await this.prisma.apiKey.create({
      data: {
        key,
        name,
        userId,
        sessionId: sessionId || null,
        isActive: true,
      },
    });

    this.logger.log(`Created new API Key for user: ${userId}`);
    return record;
  }

  /**
   * Validates an API Key, returning its associated record and session ID
   */
  async validateApiKey(key: string) {
    if (!key || typeof key !== 'string') {
      throw new UnauthorizedException('API key is required');
    }

    const now = Date.now();
    const cached = this.memoryCache.get(key);

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      if (!cached.isActive) {
        throw new UnauthorizedException('API key is inactive or revoked');
      }
      return cached;
    }

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { key },
      include: { user: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!apiKey.isActive) {
      throw new UnauthorizedException('API key is inactive or revoked');
    }

    const cachedData: CachedApiKey = {
      id: apiKey.id,
      key: apiKey.key,
      userId: apiKey.userId,
      sessionId: apiKey.sessionId,
      isActive: apiKey.isActive,
      cachedAt: now,
    };
    this.memoryCache.set(key, cachedData);

    // Update lastUsedAt asynchronously in the background
    void this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => {
        this.logger.warn(`Failed to update lastUsedAt for key ${apiKey.id}:`, err);
      });

    return cachedData;
  }

  /**
   * Links or updates a WhatsApp session ID for an API Key
   */
  async linkSessionToKey(keyId: string, body: LinkSessionDto) {
    const { sessionId } = body;
    const updated = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { sessionId },
    });

    // Invalidate memory cache so next request picks up the new session
    this.memoryCache.delete(updated.key);
    return updated;
  }

  /**
   * Returns all API Keys for a specific user
   */
  async getUserApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revokes (deactivates) an API Key
   */
  async revokeApiKey(keyId: string) {
    const record = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!record) {
      throw new NotFoundException(`API Key "${keyId}" not found`);
    }

    const updated = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    this.memoryCache.delete(record.key);
    this.logger.log(`Revoked API Key: ${keyId}`);
    return updated;
  }
}
