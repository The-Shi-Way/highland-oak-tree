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

    // Sanitize: strip characters that break tsquery/trgm
    const sanitized = query.replace(/[^\w\s]/g, '').trim();
    if (!sanitized) {
      return { results: [], total: 0, query };
    }

    // Build tsquery from words (AND logic for relevance)
    const tsQuery = sanitized
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}:*`)
      .join(' & ');

    const leaves = await this.leafRepo
      .createQueryBuilder('leaf')
      .select([
        'leaf.title',
        'leaf.slug',
        'leaf.excerpt',
        'leaf.leafType',
        'leaf.season',
        'leaf.growth',
        'leaf.publishedAt',
        'leaf.createdAt',
      ])
      .addSelect(
        `ts_rank(
          setweight(to_tsvector('english', leaf.title), 'A') ||
          setweight(to_tsvector('english', COALESCE(leaf.excerpt, '')), 'B'),
          to_tsquery('english', :tsQuery)
        )`,
        'rank',
      )
      .where('leaf.status = :status', { status: 'published' })
      .andWhere(
        `(
          to_tsvector('english', leaf.title) @@ to_tsquery('english', :tsQuery)
          OR to_tsvector('english', COALESCE(leaf.excerpt, '')) @@ to_tsquery('english', :tsQuery)
          OR leaf.title ILIKE :like
          OR leaf.excerpt ILIKE :like
        )`,
        { tsQuery, like: `%${sanitized}%` },
      )
      .orderBy('rank', 'DESC')
      .addOrderBy('leaf.publishedAt', 'DESC', 'NULLS LAST')
      .limit(40)
      .setParameters({ tsQuery, like: `%${sanitized}%` })
      .getMany();

    const results: ISearchResult[] = leaves.map((leaf) => ({
      title: leaf.title,
      excerpt: this.highlightExcerpt(leaf.excerpt ?? leaf.title, sanitized),
      leafType: leaf.leafType,
      season: leaf.season,
      growth: leaf.growth,
      slug: leaf.slug,
      publishedAt: leaf.publishedAt ?? leaf.createdAt,
    }));

    return { results, total: results.length, query };
  }

  /**
   * Simple term highlighting — wraps matching terms in <mark> tags.
   */
  private highlightExcerpt(text: string, query: string): string {
    const words = query.split(/\s+/).filter(Boolean);
    let highlighted = text;
    for (const word of words) {
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    }
    return highlighted;
  }
}
