import { IsNumber, IsOptional, IsEnum, IsString, IsBoolean, Min } from 'class-validator';

export class UpdateMeasurementDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  chest?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  waist?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hips?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shoulder?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sleeveLength?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @IsOptional()
  @IsEnum(['CM', 'INCHES'])
  unit?: 'CM' | 'INCHES';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
