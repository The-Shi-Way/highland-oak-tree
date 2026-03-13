import { ContentStatus, LeafType } from '@shared/types';

export interface IDashboardStats {
  leaves: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    byType: Record<LeafType, number>;
  };
  media: {
    total: number;
  };
}

export interface IRecentItem {
  id: string;
  title: string;
  leafType: LeafType;
  status: ContentStatus;
  updatedAt: Date;
}
