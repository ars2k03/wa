import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiKeyService } from './api_key.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { LinkSessionDto } from './dto/link-session.dto.js';
import { AuthGuard, type AuthenticatedRequest } from '../auth/guards/auth.guard.js';

@Controller('api-keys')
@UseGuards(AuthGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async createApiKey(
    @Body() body: CreateApiKeyDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user?.id) {
      body.userId = req.user.id;
    }
    const apiKey = await this.apiKeyService.createApiKey(body);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'API Key generated successfully',
      data: apiKey,
    };
  }

  @Get(':userId')
  async getUserApiKeys(
    @Param('userId') paramUserId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Prevent IDOR: users can only view their own API keys
    const currentUserId = req.user?.id;
    if (currentUserId && paramUserId !== 'me' && paramUserId !== currentUserId) {
      throw new ForbiddenException('You cannot access another user\'s API keys');
    }
    const userId = currentUserId || paramUserId;
    const keys = await this.apiKeyService.getUserApiKeys(userId);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: keys,
    };
  }

  @Put(':keyId/link-session')
  async linkSession(
    @Param('keyId') keyId: string,
    @Body() body: LinkSessionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const updated = await this.apiKeyService.linkSessionToKey(keyId, body, req.user?.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Session "${body.sessionId}" linked to API key successfully`,
      data: updated,
    };
  }

  @Delete(':keyId')
  async revokeApiKey(
    @Param('keyId') keyId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const revoked = await this.apiKeyService.revokeApiKey(keyId, req.user?.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'API Key revoked successfully',
      data: revoked,
    };
  }
}
