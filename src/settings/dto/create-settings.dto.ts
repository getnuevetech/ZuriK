import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { FeeType } from '../entities/platform-settings.entity';

export class CreateSettingsDto {
  @IsString()
  key: string;

  @IsOptional()
  @IsEnum(FeeType)
  platformFeeType?: FeeType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentageFee?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
