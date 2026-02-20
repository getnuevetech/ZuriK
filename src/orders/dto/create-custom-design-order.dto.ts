import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCustomDesignOrderDto {
  @IsString()
  designId: string;

  @IsString()
  fabricId: string;

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
  @IsString()
  unit?: 'CM' | 'INCHES';

  @IsOptional()
  @IsString()
  measurementNotes?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}
