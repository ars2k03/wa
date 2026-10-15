import { Transform } from 'class-transformer';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class SendTemplateDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Template ID is required' })
  @IsString({ message: 'Template ID must be a string' })
  templateId!: string;

  @IsOptional()
  @IsObject({ message: 'Variables must be an object, e.g. { "name": "Arafat" }' })
  variables?: Record<string, unknown>;
}
