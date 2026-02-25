import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShopByCountrySettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  scrollSpeed?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoScrollEnabled?: boolean;
}
