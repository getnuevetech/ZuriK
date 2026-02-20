import {
  IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsArray, Min, Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SortBy {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  RATING = 'rating',
  POPULARITY = 'popularity',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export class SearchProductDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  fabricType?: string;

  @IsOptional()
  @IsString()
  designerId?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : undefined))
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
