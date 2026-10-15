import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { UsageService } from './usage.service.js';
import { AuthGuard, type AuthenticatedRequest } from '../auth/guards/auth.guard.js';

@Controller('usage')
@UseGuards(AuthGuard)
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get()
  async getUsage(@Req() req: AuthenticatedRequest) {
    const usage = await this.usageService.getUsage(req.user!.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: usage,
    };
  }
}
