import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ApiKeyService } from '../api_key.service.js';

export interface AuthenticatedRequest extends Request {
  apiKeyRecord?: {
    id: string;
    userId: string;
  };
  userId?: string;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const rawKey =
      (request.headers['x-api-key'] as string) ||
      this.extractBearerToken(request.headers['authorization']);

    if (!rawKey) {
      throw new UnauthorizedException(
        'Missing API Key. Please provide "x-api-key" header or "Authorization: Bearer <key>".',
      );
    }

    const keyRecord = await this.apiKeyService.validateApiKey(rawKey.trim());

    // Inject into request object for downstream controllers
    request.apiKeyRecord = keyRecord;
    request.userId = keyRecord.userId;

    return true;
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7).trim();
  }
}
