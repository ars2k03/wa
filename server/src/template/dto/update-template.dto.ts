import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTemplateDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsNotEmpty({ message: 'Template name cannot be empty' })
  @IsString({ message: 'Template name must be a string' })
  @MaxLength(100, { message: 'Template name must be at most 100 characters' })
  name?: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsNotEmpty({ message: 'Template body cannot be empty' })
  @IsString({ message: 'Template body must be a string' })
  @MaxLength(4096, { message: 'Template body must be at most 4096 characters' })
  body?: string;
}
