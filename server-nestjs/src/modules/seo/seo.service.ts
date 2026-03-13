import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Redis from 'ioredis';

import { Result, ok, err, DomainError, LeafType } from '@shared/types';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { Leaf } from '@modules/leaf/entities/leaf.entity';
import {
  ISitemapEntry,
  ISitemapResult,
  IRssFeedItem,
  IRssFeedResult,
} from './interfaces/seo.interfaces';

const SITEMAP_CACHE_KEY = 'seo:sitemap:xml';
const RSS_CACHE_PREFIX = 'seo:rss:';
const CACHE_TTL = 3600; // 1 hour

const LEAF_TYPES: readonly LeafType[] = ['prose', 'blossom', 'fruit', 'seed'] as const;

const STATIC_PAGES = [
  { path: '/canopy', changefreq: 'weekly' as const, priority: '0.7' },
  { path: '/forest-floor', changefreq: 'monthly' as const, priority: '0.5' },
  { path: '/roots', changefreq: 'monthly' as const, priority: '0.4' },
  { path: '/grove', changefreq: 'weekly' as const, priority: '0.5' },
  { path: '/growth-rings', changefreq: 'weekly' as const, priority: '0.5' },
  { path: '/search', changefreq: 'weekly' as const, priority: '0.3' },
];

@Injectable()
export class SeoService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(Leaf)
    private readonly leafRepo: Repository<Leaf>,
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
      void this.invalidateAllCaches();
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

      const leaves = await this.leafRepo.find({
        select: ['slug', 'leafType', 'updatedAt'],
        where: { status: 'published' },
        order: { updatedAt: 'DESC' },
      });

      const now = new Date().toISOString().split('T')[0];

      const entries: ISitemapEntry[] = [
        // Homepage (Trunk)
        { loc: this.baseUrl, lastmod: now, changefreq: 'daily', priority: '1.0' },
        // Branch landing pages
        ...LEAF_TYPES.map((lt) => ({
          loc: `${this.baseUrl}/${lt}`,
          lastmod: now,
          changefreq: 'weekly' as const,
          priority: '0.8',
        })),
        // Static pages
        ...STATIC_PAGES.map((page) => ({
          loc: `${this.baseUrl}${page.path}`,
          lastmod: now,
          changefreq: page.changefreq,
          priority: page.priority,
        })),
        // Individual leaves: /{leafType}/{slug}
        ...leaves.map((leaf) => ({
          loc: `${this.baseUrl}/${leaf.leafType}/${leaf.slug}`,
          lastmod: leaf.updatedAt.toISOString().split('T')[0],
          changefreq: 'weekly' as const,
          priority: '0.7',
        })),
      ];

      const xml = this.buildSitemapXml(entries);
      await this.redis.setex(SITEMAP_CACHE_KEY, CACHE_TTL, xml);

      return ok({ xml, entryCount: entries.length });
    } catch {
      return err({
        kind: 'external_service' as const,
        service: 'database',
        message: 'Failed to generate sitemap',
      });
    }
  }

  async generateMainFeed(): Promise<Result<IRssFeedResult, DomainError>> {
    return this.generateFeed(undefined, 'The Wind — The Highland Oak Tree', 'All leaves carried by the wind');
  }

  async generateBranchFeed(leafType: LeafType): Promise<Result<IRssFeedResult, DomainError>> {
    const branchNames: Record<LeafType, string> = {
      prose: 'Prose Branch',
      blossom: 'Blossom Branch',
      fruit: 'Fruit Branch',
      seed: 'Seed Branch',
    };
    return this.generateFeed(
      leafType,
      `${branchNames[leafType]} — The Highland Oak Tree`,
      `${branchNames[leafType]} leaves from The Highland Oak Tree`,
    );
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

  private async generateFeed(
    leafType: LeafType | undefined,
    title: string,
    description: string,
  ): Promise<Result<IRssFeedResult, DomainError>> {
    try {
      const cacheKey = `${RSS_CACHE_PREFIX}${leafType ?? 'main'}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const itemCount = (cached.match(/<item>/g) ?? []).length;
        return ok({ xml: cached, itemCount });
      }

      const qb = this.leafRepo
        .createQueryBuilder('leaf')
        .where('leaf.status = :status', { status: 'published' });

      if (leafType) {
        qb.andWhere('leaf.leafType = :leafType', { leafType });
      }

      const leaves = await qb
        .orderBy('leaf.publishedAt', 'DESC')
        .limit(50)
        .getMany();

      const feedUrl = leafType ? `${this.baseUrl}/${leafType}/feed` : `${this.baseUrl}/feed`;

      const items: IRssFeedItem[] = leaves.map((leaf) => ({
        title: leaf.title,
        link: `${this.baseUrl}/${leaf.leafType}/${leaf.slug}`,
        description: leaf.excerpt ?? leaf.title,
        leafType: leaf.leafType,
        pubDate: (leaf.publishedAt ?? leaf.createdAt).toUTCString(),
        guid: `${this.baseUrl}/${leaf.leafType}/${leaf.slug}`,
      }));

      const xml = this.buildRssXml(title, description, feedUrl, items);
      await this.redis.setex(cacheKey, CACHE_TTL, xml);

      return ok({ xml, itemCount: items.length });
    } catch {
      return err({
        kind: 'external_service' as const,
        service: 'database',
        message: `Failed to generate RSS feed${leafType ? ` for ${leafType}` : ''}`,
      });
    }
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

  private buildRssXml(
    title: string,
    description: string,
    feedUrl: string,
    items: IRssFeedItem[],
  ): string {
    const itemsXml = items
      .map(
        (item) =>
          `    <item>\n      <title>${this.escapeXml(item.title)}</title>\n      <link>${this.escapeXml(item.link)}</link>\n      <description>${this.escapeXml(item.description)}</description>\n      <pubDate>${item.pubDate}</pubDate>\n      <guid isPermaLink="true">${this.escapeXml(item.guid)}</guid>\n      <category>${item.leafType}</category>\n    </item>`,
      )
      .join('\n');

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
      '  <channel>',
      `    <title>${this.escapeXml(title)}</title>`,
      `    <link>${this.escapeXml(this.baseUrl)}</link>`,
      `    <description>${this.escapeXml(description)}</description>`,
      `    <atom:link href="${this.escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>`,
      `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      itemsXml,
      '  </channel>',
      '</rss>',
    ].join('\n');
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private async invalidateAllCaches(): Promise<void> {
    const keys = await this.redis.keys(`${RSS_CACHE_PREFIX}*`);
    const allKeys = [SITEMAP_CACHE_KEY, ...keys];
    if (allKeys.length > 0) {
      await this.redis.del(...allKeys);
    }
  }
}
