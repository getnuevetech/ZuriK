import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { CreateFabricDto } from './create-fabric.dto';

export class UpdateFabricDto extends PartialType(CreateFabricDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;
}
