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
