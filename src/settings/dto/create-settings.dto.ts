import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  showFeaturedReadyToWear?: boolean;

  @IsOptional()
  @IsBoolean()
  showFeaturedDesigns?: boolean;

  @IsOptional()
  @IsBoolean()
  showFeaturedFabrics?: boolean;
}
