import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SaveOtpTemplateDto } from './dto/save-otp-template.dto.js';
import {
  ANY_PLACEHOLDER,
  CODE_PLACEHOLDER,
  DEFAULT_OTP_TEMPLATE,
  type OtpTemplateContent,
} from './otp_template.constants.js';

@Injectable()
export class OtpTemplateService {
  private readonly logger = new Logger(OtpTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the user's custom OTP template, or null when they use the default
   */
  async getTemplate(userId: string) {
    return this.prisma.otpTemplate.findUnique({ where: { userId } });
  }

  /**
   * The content to send for this user: their custom template, or the default one
   */
  async getEffectiveTemplate(userId: string): Promise<OtpTemplateContent> {
    const template = await this.getTemplate(userId);
    if (!template) return DEFAULT_OTP_TEMPLATE;
    return {
      body: template.body,
      footer: template.footer,
      showCopyButton: template.showCopyButton,
      copyButtonText: template.copyButtonText,
    };
  }

  /**
   * Creates or replaces the user's OTP template (one per user)
   */
  async saveTemplate(userId: string, body: SaveOtpTemplateDto) {
    const content = this.validate(body);
    return this.prisma.otpTemplate.upsert({
      where: { userId },
      create: { userId, ...content },
      update: content,
    });
  }

  /**
   * Deletes the user's OTP template so the default message is sent again
   */
  async deleteTemplate(userId: string) {
    const { count } = await this.prisma.otpTemplate.deleteMany({ where: { userId } });
    if (count > 0) {
      this.logger.log(`Reset OTP template to default for user: ${userId}`);
    }
    return { deleted: count > 0 };
  }

  /**
   * Checks the rules that class-validator can't express and normalises the content
   */
  validate(input: SaveOtpTemplateDto): OtpTemplateContent {
    const others = [...input.body.matchAll(ANY_PLACEHOLDER)]
      .map((m) => m[1])
      .filter((name) => name !== 'code');
    if (others.length > 0) {
      throw new BadRequestException(
        `Only {{code}} can be used in the message. Remove: ${[...new Set(others)].map((n) => `{{${n}}}`).join(', ')}`,
      );
    }
    if (!new RegExp(CODE_PLACEHOLDER.source).test(input.body)) {
      throw new BadRequestException('The message must include {{code}} where the OTP should appear');
    }

    const footer = input.footer?.trim() || null;
    if (footer && new RegExp(ANY_PLACEHOLDER.source).test(footer)) {
      throw new BadRequestException('The footer cannot contain placeholders like {{code}}');
    }

    const copyButtonText = input.copyButtonText?.trim() || DEFAULT_OTP_TEMPLATE.copyButtonText;

    return {
      body: input.body,
      footer,
      showCopyButton: input.showCopyButton,
      copyButtonText,
    };
  }
}
