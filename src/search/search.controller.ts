import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class SearchQueryDto {
  @IsString() q: string;
  @IsOptional() @IsIn(['all', 'products', 'fabrics']) type?: 'all' | 'products' | 'fabrics';
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50) limit?: number;
}

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'products', 'fabrics'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q ?? '', query.type, query.limit);
  }
}
