import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';

// Matches {{name}}, {{ order_id }} etc.
const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
const MAX_VARIABLE_LENGTH = 1024;

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the unique variable names used in a template body, in order of first appearance
   */
  extractVariables(body: string): string[] {
    const names = new Set<string>();
    for (const match of body.matchAll(VARIABLE_PATTERN)) {
      names.add(match[1]);
    }
    return [...names];
  }

  /**
   * Fills a template body with the given values. Every variable in the body must be provided;
   * extra values are ignored.
   */
  renderTemplate(body: string, values: Record<string, unknown> = {}): string {
    const variables = this.extractVariables(body);
    const missing = variables.filter((name) => {
      const value = values[name];
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });
    if (missing.length > 0) {
      throw new BadRequestException(`Missing template variables: ${missing.join(', ')}`);
    }

    const texts = new Map<string, string>();
    for (const name of variables) {
      const value = values[name];
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        throw new BadRequestException(`Template variable "${name}" must be a string or number`);
      }
      const text = String(value);
      if (text.length > MAX_VARIABLE_LENGTH) {
        throw new BadRequestException(
          `Template variable "${name}" must be at most ${MAX_VARIABLE_LENGTH} characters`,
        );
      }
      texts.set(name, text);
    }

    return body.replace(VARIABLE_PATTERN, (_, name: string) => texts.get(name)!);
  }

  async createTemplate(userId: string, body: CreateTemplateDto) {
    try {
      return await this.prisma.messageTemplate.create({
        data: {
          userId,
          name: body.name,
          body: body.body,
          variables: this.extractVariables(body.body),
        },
      });
    } catch (err) {
      this.rethrowDuplicateName(err, body.name);
    }
  }

  async getUserTemplates(userId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches a template owned by the user. Other users' templates are reported as not found.
   */
  async getTemplate(templateId: string, userId: string) {
    const record = await this.prisma.messageTemplate.findFirst({
      where: { id: templateId, userId },
    });

    if (!record) {
      throw new NotFoundException(`Template "${templateId}" not found`);
    }
    return record;
  }

  async updateTemplate(templateId: string, userId: string, body: UpdateTemplateDto) {
    await this.getTemplate(templateId, userId);

    try {
      return await this.prisma.messageTemplate.update({
        where: { id: templateId },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.body !== undefined && {
            body: body.body,
            variables: this.extractVariables(body.body),
          }),
        },
      });
    } catch (err) {
      this.rethrowDuplicateName(err, body.name);
    }
  }

  async deleteTemplate(templateId: string, userId: string) {
    await this.getTemplate(templateId, userId);

    await this.prisma.messageTemplate.delete({
      where: { id: templateId },
    });

    this.logger.log(`Deleted template: ${templateId}`);
    return { id: templateId, deleted: true };
  }

  private rethrowDuplicateName(err: unknown, name?: string): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException(`A template named "${name}" already exists`);
    }
    throw err;
  }
}
