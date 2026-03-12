import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { SearchService } from './search.service';
import { ISearchResponse } from './interfaces/search.interfaces';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search published posts and poems (public)' })
  async search(@Query('q') query: string): Promise<ISearchResponse> {
    return this.searchService.search(query ?? '');
  }
}
