import { IsEnum, IsString, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestedRole } from '../entities/seller-application.entity';

export class CreateSellerApplicationDto {
  @ApiProperty({ enum: RequestedRole })
  @IsEnum(RequestedRole)
  requestedRole: RequestedRole;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  businessDescription: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  experience?: string;
}
