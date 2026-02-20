import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  fabricType?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  sizes?: string[];

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsString()
  country: string;

  @IsNumber()
  @Min(0)
  designerPrice: number;

  @IsNumber()
  @Min(0)
  customerPrice: number;
}
