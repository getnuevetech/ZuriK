import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateSettingsDto {
  @IsString()
  key: string;

  @IsNumber()
  @Min(0)
  percentageFee: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
