import {
  IsString, IsOptional, IsArray, IsInt, IsBoolean, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryHeroDto {
  @ApiProperty()
  @IsString()
  countryName: string;

  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  heroImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1000)
  rotationInterval?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
