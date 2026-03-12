import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Redis from 'ioredis';

import { Result, ok, err, DomainError } from '@shared/types';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { Post } from '@modules/post/entities/post.entity';
import { Poem } from '@modules/poem/entities/poem.entity';
import { ISitemapEntry, ISitemapResult } from './interfaces/seo.interfaces';

const SITEMAP_CACHE_KEY = 'seo:sitemap:xml';
const SITEMAP_TTL = 3600; // 1 hour

@Injectable()
export class SeoService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Poem)
    private readonly poemRepo: Repository<Poem>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('SITE_BASE_URL') ?? 'https://thehighlandoaktree.com';
  }

  async onModuleInit(): Promise<void> {
    this.subscriber = this.redis.duplicate();
    await this.subscriber.subscribe('content:published', 'content:unpublished');
    this.subscriber.on('message', () => {
      void this.invalidateSitemapCache();
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.unsubscribe();
      await this.subscriber.quit();
    }
  }

  async generateSitemap(): Promise<Result<ISitemapResult, DomainError>> {
    try {
      const cached = await this.redis.get(SITEMAP_CACHE_KEY);
      if (cached) {
        const entryCount = (cached.match(/<url>/g) ?? []).length;
        return ok({ xml: cached, entryCount });
      }

      const [posts, poems] = await Promise.all([
        this.postRepo.find({
          select: ['slug', 'updatedAt'],
          where: { status: 'published' },
          order: { updatedAt: 'DESC' },
        }),
        this.poemRepo.find({
          select: ['id', 'updatedAt'],
          where: { status: 'published' },
          order: { updatedAt: 'DESC' },
        }),
      ]);

      const entries: ISitemapEntry[] = [
        {
          loc: this.baseUrl,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily',
          priority: '1.0',
        },
        {
          loc: `${this.baseUrl}/poetry`,
          lastmod: poems.length > 0
            ? poems[0].updatedAt.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8',
        },
        ...posts.map((post) => ({
          loc: `${this.baseUrl}/posts/${post.slug}`,
          lastmod: post.updatedAt.toISOString().split('T')[0],
          changefreq: 'weekly' as const,
          priority: '0.7',
        })),
        ...poems.map((poem) => ({
          loc: `${this.baseUrl}/poetry/${poem.id}`,
          lastmod: poem.updatedAt.toISOString().split('T')[0],
          changefreq: 'monthly' as const,
          priority: '0.6',
        })),
      ];

      const xml = this.buildSitemapXml(entries);
      await this.redis.setex(SITEMAP_CACHE_KEY, SITEMAP_TTL, xml);

      return ok({ xml, entryCount: entries.length });
    } catch {
      return err({
        kind: 'external_service' as const,
        service: 'database',
        message: 'Failed to generate sitemap',
      });
    }
  }

  getRobotsTxt(): string {
    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin/',
      'Disallow: /api/',
      '',
      `Sitemap: ${this.baseUrl}/sitemap.xml`,
    ].join('\n');
  }

  private buildSitemapXml(entries: ISitemapEntry[]): string {
    const urls = entries
      .map(
        (e) =>
          `  <url>\n    <loc>${this.escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async invalidateSitemapCache(): Promise<void> {
    await this.redis.del(SITEMAP_CACHE_KEY);
  }
}
