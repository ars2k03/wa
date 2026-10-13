import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class PairingCodeDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber!: string;
}
