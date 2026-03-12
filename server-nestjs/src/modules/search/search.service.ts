import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from '@modules/post/entities/post.entity';
import { Poem } from '@modules/poem/entities/poem.entity';
import { ISearchResult, ISearchResponse } from './interfaces/search.interfaces';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Poem)
    private readonly poemRepo: Repository<Poem>,
  ) {}

  async search(query: string): Promise<ISearchResponse> {
    if (!query.trim()) {
      return { results: [], total: 0, query };
    }

    const sanitized = query.replace(/[^\w\s]/g, '').trim();
    const tsQuery = sanitized.split(/\s+/).join(' & ');

    const [postResults, poemResults] = await Promise.all([
      this.searchPosts(tsQuery, sanitized),
      this.searchPoems(tsQuery, sanitized),
    ]);

    const results = [...postResults, ...poemResults].sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
    );

    return { results, total: results.length, query };
  }

  private async searchPosts(tsQuery: string, rawQuery: string): Promise<ISearchResult[]> {
    const posts = await this.postRepo
      .createQueryBuilder('post')
      .where('post.status = :status', { status: 'published' })
      .andWhere(
        `(post.title ILIKE :like OR post.slug ILIKE :like)`,
        { like: `%${rawQuery}%` },
      )
      .orderBy('post.publishedAt', 'DESC')
      .limit(20)
      .getMany();

    return posts.map((p) => ({
      title: p.title,
      excerpt: p.excerpt ?? p.title,
      contentType: 'post' as const,
      slug: p.slug,
      publishedAt: p.publishedAt ?? p.createdAt,
    }));
  }

  private async searchPoems(tsQuery: string, rawQuery: string): Promise<ISearchResult[]> {
    const poems = await this.poemRepo
      .createQueryBuilder('poem')
      .where('poem.status = :status', { status: 'published' })
      .andWhere(`poem.title ILIKE :like`, { like: `%${rawQuery}%` })
      .orderBy('poem.publishedAt', 'DESC')
      .limit(20)
      .getMany();

    return poems.map((p) => ({
      title: p.title,
      excerpt: p.title,
      contentType: 'poem' as const,
      slug: p.id,
      publishedAt: p.publishedAt ?? p.createdAt,
    }));
  }
}
