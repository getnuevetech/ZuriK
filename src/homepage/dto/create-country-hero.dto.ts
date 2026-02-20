import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, IsUrl, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransitionStyle } from '../entities/country-hero.entity';

class HeroImageDto {
  @IsUrl()
  url: string;

  @IsString()
  alt: string;

  @IsString()
  caption: string;
}

export class CreateCountryHeroDto {
  @IsString()
  countryCode: string;

  @IsString()
  countryName: string;

  @IsOptional()
  @IsString()
  flagUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroImageDto)
  heroImages?: HeroImageDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  rotationInterval?: number;

  @IsOptional()
  @IsEnum(TransitionStyle)
  transitionStyle?: TransitionStyle;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
