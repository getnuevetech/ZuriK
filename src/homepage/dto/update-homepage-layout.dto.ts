import { IsArray, ValidateNested, IsString, IsEnum, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SectionType } from '../entities/homepage-layout.entity';

class LayoutSectionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ enum: SectionType })
  @IsEnum(SectionType)
  sectionType: SectionType;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiProperty()
  @IsInt()
  displayOrder: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class UpdateHomepageLayoutDto {
  @ApiProperty({ type: [LayoutSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutSectionDto)
  sections: LayoutSectionDto[];
}
