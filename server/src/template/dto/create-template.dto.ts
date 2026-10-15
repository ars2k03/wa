import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTemplateDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Template name is required' })
  @IsString({ message: 'Template name must be a string' })
  @MaxLength(100, { message: 'Template name must be at most 100 characters' })
  name!: string;

  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Template body is required' })
  @IsString({ message: 'Template body must be a string' })
  @MaxLength(4096, { message: 'Template body must be at most 4096 characters' })
  body!: string;
}
