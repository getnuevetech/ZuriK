import { IsString, IsOptional } from 'class-validator';

export class CalculateOrderDto {
  @IsString()
  designId: string;

  @IsString()
  fabricId: string;

  @IsOptional()
  @IsString()
  country?: string;
}
