export interface ISearchResult {
  title: string;
  excerpt: string;
  contentType: 'post' | 'poem';
  slug: string;
  publishedAt: Date;
}

export interface ISearchResponse {
  results: ISearchResult[];
  total: number;
  query: string;
}
