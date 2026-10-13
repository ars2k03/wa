import { Module } from '@nestjs/common';
import { ApiKeyService } from './api_key.service.js';
import { ApiKeyController } from './api_key.controller.js';
import { ApiKeyGuard } from './guards/api-key.guard.js';

@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyGuard],
  exports: [ApiKeyService, ApiKeyGuard],
})
export class ApiKeyModule {}
