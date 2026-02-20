import { IsString, IsOptional, IsEnum, IsArray, IsInt, IsBoolean, Min } from 'class-validator';
import { SelectionMode } from '../entities/featured-section.entity';

export class CreateFeaturedSectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(SelectionMode)
  selectionMode?: SelectionMode;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  manualProductIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRows?: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
