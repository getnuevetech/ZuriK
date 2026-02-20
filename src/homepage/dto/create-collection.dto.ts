import { IsString, IsOptional, IsEnum, IsArray, IsInt, IsBoolean, Min } from 'class-validator';
import { DisplayMode } from '../entities/collection-display.entity';

export class CreateCollectionDto {
  @IsString()
  collectionName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DisplayMode)
  displayMode?: DisplayMode;

  @IsOptional()
  @IsString()
  editorialImage?: string;

  @IsOptional()
  @IsString()
  editorialOverlayText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxProducts?: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
