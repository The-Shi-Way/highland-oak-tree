import { LeafType } from '@shared/types';

export interface ISitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

export interface ISitemapResult {
  xml: string;
  entryCount: number;
}

export interface IRssFeedItem {
  title: string;
  link: string;
  description: string;
  leafType: LeafType;
  pubDate: string;
  guid: string;
}

export interface IRssFeedResult {
  xml: string;
  itemCount: number;
}
