import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ComparisonService } from './comparisons.service';
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

class CompareItemsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  ids: string[];
}

@ApiTags('comparisons')
@Controller('comparisons')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post('designs')
  @ApiOperation({ summary: 'Compare designs side-by-side (max 4)' })
  compareDesigns(@Body() dto: CompareItemsDto) {
    return this.comparisonService.compareDesigns(dto.ids);
  }

  @Post('ready-to-wear')
  @ApiOperation({ summary: 'Compare ready-to-wear products side-by-side (max 4)' })
  compareReadyToWear(@Body() dto: CompareItemsDto) {
    return this.comparisonService.compareReadyToWear(dto.ids);
  }
}
