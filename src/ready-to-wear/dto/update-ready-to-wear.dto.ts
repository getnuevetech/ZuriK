import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateReadyToWearDto } from './create-ready-to-wear.dto';

export class UpdateReadyToWearDto extends PartialType(CreateReadyToWearDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
