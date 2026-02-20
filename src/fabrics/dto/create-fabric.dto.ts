import { IsString, IsOptional, IsNumber, IsArray, Min } from 'class-validator';

export class CreateFabricDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  colors?: string[];

  @IsOptional()
  @IsArray()
  patterns?: string[];

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsString()
  country: string;

  @IsNumber()
  @Min(0)
  sellerPrice: number;

  @IsNumber()
  @Min(0)
  customerPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}
