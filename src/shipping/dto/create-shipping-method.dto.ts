import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class CreateShippingMethodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @IsInt()
  @Min(0)
  estimatedMinDays: number;

  @IsInt()
  @Min(0)
  estimatedMaxDays: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedCountries?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
