import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SellerApplicationStatus } from '../entities/seller-application.entity';

export class ReviewSellerApplicationDto {
  @ApiProperty({ enum: [SellerApplicationStatus.APPROVED, SellerApplicationStatus.REJECTED] })
  @IsEnum(SellerApplicationStatus)
  status: SellerApplicationStatus.APPROVED | SellerApplicationStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
