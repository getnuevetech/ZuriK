import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeasurementInputDto {
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

export class CreateOrderDto {
  @IsString()
  designId: string;

  @IsString()
  fabricId: string;

  @ValidateNested()
  @Type(() => MeasurementInputDto)
  measurements: MeasurementInputDto;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}
