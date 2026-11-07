import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class InitSessionDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString({ message: 'User ID must be a string' })
  userId?: string;
}
