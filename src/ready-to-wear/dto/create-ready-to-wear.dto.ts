import { IsString, IsOptional, IsNumber, IsArray, Min, IsBoolean } from 'class-validator';

export class CreateReadyToWearDto {
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

  @IsNumber()
  @Min(0)
  designerPrice: number;

  @IsNumber()
  @Min(0)
  customerPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;
}
