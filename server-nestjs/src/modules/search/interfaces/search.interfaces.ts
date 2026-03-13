import { LeafType, Season, GrowthStage } from '@shared/types';

export interface ISearchResult {
  title: string;
  excerpt: string;
  leafType: LeafType;
  season: Season;
  growth: GrowthStage;
  slug: string;
  publishedAt: Date;
}

export interface ISearchResponse {
  results: ISearchResult[];
  total: number;
  query: string;
}
