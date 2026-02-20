import { IsString, IsOptional, IsBoolean, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeroBannerDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLink?: string;

  @ApiPropertyOptional({ enum: ['image', 'video'], default: 'image' })
  @IsOptional()
  @IsIn(['image', 'video'])
  mediaType?: string;

  @ApiProperty()
  @IsString()
  mediaUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobileMediaUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  overlayOpacity?: number;
}
