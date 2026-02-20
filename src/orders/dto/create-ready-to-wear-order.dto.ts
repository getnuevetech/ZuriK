import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateReadyToWearOrderDto {
  @IsString()
  designId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}
