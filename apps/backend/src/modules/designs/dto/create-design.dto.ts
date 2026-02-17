import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsEnum, IsOptional, Min } from 'class-validator';
import { DesignCategory } from '../../../database/entities/design.entity';

export class CreateDesignDto {
  @ApiProperty({ example: 'Elegant Evening Gown' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Beautiful handcrafted evening gown with traditional patterns' })
  @IsString()
  description: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ enum: DesignCategory, example: DesignCategory.DRESS })
  @IsEnum(DesignCategory)
  category: DesignCategory;

  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  country: string;

  @ApiProperty({ example: ['african', 'traditional', 'elegant'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'Intermediate', required: false })
  @IsString()
  @IsOptional()
  difficultyLevel?: string;

  @ApiProperty({ example: 7, required: false })
  @IsNumber()
  @IsOptional()
  estimatedTimeDays?: number;
}
