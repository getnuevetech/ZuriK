import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateFabricOnlyOrderDto {
  @IsString()
  fabricId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  customerNotes?: string;
}
