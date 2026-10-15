import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TemplateService } from './template.service.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { AuthGuard, type AuthenticatedRequest } from '../auth/guards/auth.guard.js';

@Controller('templates')
@UseGuards(AuthGuard)
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  async createTemplate(
    @Body() body: CreateTemplateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const template = await this.templateService.createTemplate(req.user!.id, body);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Template created successfully',
      data: template,
    };
  }

  @Get()
  async getUserTemplates(@Req() req: AuthenticatedRequest) {
    const templates = await this.templateService.getUserTemplates(req.user!.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: templates,
    };
  }

  @Get(':templateId')
  async getTemplate(
    @Param('templateId') templateId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const template = await this.templateService.getTemplate(templateId, req.user!.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: template,
    };
  }

  @Patch(':templateId')
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() body: UpdateTemplateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const template = await this.templateService.updateTemplate(templateId, req.user!.id, body);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Template updated successfully',
      data: template,
    };
  }

  @Delete(':templateId')
  async deleteTemplate(
    @Param('templateId') templateId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const deleted = await this.templateService.deleteTemplate(templateId, req.user!.id);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Template deleted successfully',
      data: deleted,
    };
  }
}
