import {
  ContentStatus,
  LeafId,
  LeafType,
  Season,
  GrowthStage,
} from '@shared/types';

export interface ILeaf {
  id: LeafId;
  title: string;
  slug: string;
  body: Record<string, unknown>;
  excerpt: string | null;
  featuredImage: string | null;
  leafType: LeafType;
  season: Season;
  growth: GrowthStage;
  vines: string[];
  status: ContentStatus;
  isForestFloor: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateLeaf {
  title: string;
  body: Record<string, unknown>;
  leafType: LeafType;
  growth?: GrowthStage;
  vines?: string[];
  excerpt?: string;
  featuredImage?: string;
}

export interface IUpdateLeaf {
  title?: string;
  body?: Record<string, unknown>;
  leafType?: LeafType;
  growth?: GrowthStage;
  vines?: string[];
  excerpt?: string | null;
  featuredImage?: string | null;
}

export interface ILeafListQuery {
  page: number;
  limit: number;
  leafType?: LeafType;
  season?: Season;
  growth?: GrowthStage;
  vine?: string;
}

export interface ILeafListResult {
  leaves: ILeaf[];
  total: number;
  page: number;
  limit: number;
}
