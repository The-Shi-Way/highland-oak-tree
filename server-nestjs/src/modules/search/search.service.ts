import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Leaf } from '@modules/leaf/entities/leaf.entity';
import { ISearchResult, ISearchResponse } from './interfaces/search.interfaces';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Leaf)
    private readonly leafRepo: Repository<Leaf>,
  ) {}

  async search(query: string): Promise<ISearchResponse> {
    if (!query.trim()) {
      return { results: [], total: 0, query };
    }

    const sanitized = query.replace(/[^\w\s]/g, '').trim();

    const leaves = await this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .andWhere('leaf.title ILIKE :like', { like: `%${sanitized}%` })
      .orderBy('leaf.publishedAt', 'DESC')
      .limit(40)
      .getMany();

    const results: ISearchResult[] = leaves.map((leaf) => ({
      title: leaf.title,
      excerpt: leaf.excerpt ?? leaf.title,
      leafType: leaf.leafType,
      season: leaf.season,
      growth: leaf.growth,
      slug: leaf.slug,
      publishedAt: leaf.publishedAt ?? leaf.createdAt,
    }));

    return { results, total: results.length, query };
  }
}
