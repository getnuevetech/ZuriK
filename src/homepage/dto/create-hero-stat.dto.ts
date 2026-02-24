import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHeroStatDto {
  @ApiProperty({ example: 'Countries' })
  @IsString()
  label: string;

  @ApiProperty({ example: '150' })
  @IsString()
  value: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
