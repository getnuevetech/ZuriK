import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateTaxDto {
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  taxName: string;

  @IsNumber()
  @Min(0)
  baseTaxRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adminMarkupRate?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
