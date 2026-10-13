import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiKeyService } from './api_key.service.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { LinkSessionDto } from './dto/link-session.dto.js';

@Controller('api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async createApiKey(@Body() body: CreateApiKeyDto) {
    const apiKey = await this.apiKeyService.createApiKey(body);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'API Key generated successfully',
      data: apiKey,
    };
  }

  @Get(':userId')
  async getUserApiKeys(@Param('userId') userId: string) {
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
  ) {
    const updated = await this.apiKeyService.linkSessionToKey(keyId, body);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: `Session "${body.sessionId}" linked to API key successfully`,
      data: updated,
    };
  }

  @Delete(':keyId')
  async revokeApiKey(@Param('keyId') keyId: string) {
    const revoked = await this.apiKeyService.revokeApiKey(keyId);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'API Key revoked successfully',
      data: revoked,
    };
  }
}
