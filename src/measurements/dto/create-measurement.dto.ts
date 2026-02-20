import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateMeasurementDto {
  @IsNumber()
  @Min(0)
  chest: number;

  @IsNumber()
  @Min(0)
  waist: number;

  @IsNumber()
  @Min(0)
  hips: number;

  @IsNumber()
  @Min(0)
  shoulder: number;

  @IsNumber()
  @Min(0)
  sleeveLength: number;

  @IsNumber()
  @Min(0)
  length: number;

  @IsOptional()
  @IsEnum(['CM', 'INCHES'])
  unit?: 'CM' | 'INCHES';
}
