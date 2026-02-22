import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class SearchQueryDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsIn(['all', 'designs', 'ready-to-wear', 'fabrics']) type?: 'all' | 'designs' | 'ready-to-wear' | 'fabrics';
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50) limit?: number;
}

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: ['all', 'designs', 'ready-to-wear', 'fabrics'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query.q ?? '', query.type, query.limit);
  }
}
