import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsString, IsBoolean, IsOptional, Min } from 'class-validator';
import { MeasurementUnit } from '../../../database/entities/measurement.entity';

export class CreateMeasurementDto {
  @ApiProperty({ example: 36 })
  @IsNumber()
  @Min(0)
  bust: number;

  @ApiProperty({ example: 28 })
  @IsNumber()
  @Min(0)
  waist: number;

  @ApiProperty({ example: 38 })
  @IsNumber()
  @Min(0)
  hips: number;

  @ApiProperty({ example: 16 })
  @IsNumber()
  @Min(0)
  shoulder: number;

  @ApiProperty({ example: 23 })
  @IsNumber()
  @Min(0)
  armLength: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(0)
  inseam: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  neck: number;

  @ApiProperty({ example: 38 })
  @IsNumber()
  @Min(0)
  chest: number;

  @ApiProperty({ example: 'Standard measurements for formal wear', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ enum: MeasurementUnit, default: MeasurementUnit.INCHES })
  @IsEnum(MeasurementUnit)
  @IsOptional()
  unit?: MeasurementUnit;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ example: 'Wedding Outfit', required: false })
  @IsString()
  @IsOptional()
  label?: string;
}
