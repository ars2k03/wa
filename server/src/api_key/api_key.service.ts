import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';

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

    if (!userId) {
      throw new BadRequestException('User ID is required to generate an API key');
    }

    // Ensure linked session belongs to this user if specified
    if (sessionId && userId) {
      const sessionRecord = await this.prisma.whatsAppSessionRecord.findUnique({
        where: { sessionId },
      });
      if (sessionRecord && sessionRecord.userId !== userId) {
        throw new ForbiddenException(
          `You cannot link session "${sessionId}" because it belongs to another user`,
        );
      }
    }

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
   * Returns all API Keys for a specific user
   */
  async getUserApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Permanently deletes an API Key
   */
  async deleteApiKey(keyId: string, userId?: string) {
    const record = await this.prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!record) {
      throw new NotFoundException(`API Key "${keyId}" not found`);
    }

    if (userId && record.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this API key');
    }

    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });

    this.memoryCache.delete(record.key);
    this.logger.log(`Deleted API Key: ${keyId}`);
    return { id: keyId, deleted: true };
  }
}
