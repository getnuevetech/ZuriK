import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsEnum, IsOptional, Min } from 'class-validator';
import { FabricType } from '../../../database/entities/fabric.entity';

export class CreateFabricDto {
  @ApiProperty({ example: 'Premium Ankara Fabric' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'High-quality ankara fabric with vibrant patterns' })
  @IsString()
  description: string;

  @ApiProperty({ example: 25.00 })
  @IsNumber()
  @Min(0)
  pricePerMeter: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ example: ['https://example.com/fabric1.jpg', 'https://example.com/fabric2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ example: ['Red', 'Blue', 'Gold'] })
  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @ApiProperty({ enum: FabricType, example: FabricType.ANKARA })
  @IsEnum(FabricType)
  fabricType: FabricType;

  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  country: string;

  @ApiProperty({ example: 45, required: false })
  @IsNumber()
  @IsOptional()
  widthInches?: number;

  @ApiProperty({ example: ['traditional', 'vibrant', 'wedding'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
