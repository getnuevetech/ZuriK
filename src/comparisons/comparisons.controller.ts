import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ComparisonService } from './comparisons.service';
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

class CompareProductsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  productIds: string[];
}

@ApiTags('comparisons')
@Controller('comparisons')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post('products')
  @ApiOperation({ summary: 'Compare products side-by-side (max 4)' })
  compareProducts(@Body() dto: CompareProductsDto) {
    return this.comparisonService.compareProducts(dto.productIds);
  }
}
