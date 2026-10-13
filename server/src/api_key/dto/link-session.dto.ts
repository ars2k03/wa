import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkSessionDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Session ID is required' })
  @IsString({ message: 'Session ID must be a string' })
  sessionId!: string;
}
