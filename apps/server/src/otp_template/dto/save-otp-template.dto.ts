import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { OTP_TEMPLATE_LIMITS } from '../otp_template.constants.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class SaveOtpTemplateDto {
  @Transform(trim)
  @IsNotEmpty({ message: 'Message body is required' })
  @IsString({ message: 'Message body must be a string' })
  @MaxLength(OTP_TEMPLATE_LIMITS.body, {
    message: `Message body must be at most ${OTP_TEMPLATE_LIMITS.body} characters`,
  })
  body!: string;

  @Transform(trim)
  @IsOptional()
  @IsString({ message: 'Footer must be a string' })
  @MaxLength(OTP_TEMPLATE_LIMITS.footer, {
    message: `Footer must be at most ${OTP_TEMPLATE_LIMITS.footer} characters`,
  })
  footer?: string;

  @IsBoolean({ message: 'showCopyButton must be true or false' })
  showCopyButton!: boolean;

  @Transform(trim)
  @IsOptional()
  @IsString({ message: 'Copy button text must be a string' })
  @MaxLength(OTP_TEMPLATE_LIMITS.copyButtonText, {
    message: `Copy button text must be at most ${OTP_TEMPLATE_LIMITS.copyButtonText} characters`,
  })
  copyButtonText?: string;
}
