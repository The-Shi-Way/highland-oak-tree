import { ContentStatus } from '@shared/types';

export interface IDashboardStats {
  posts: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  poems: {
    total: number;
    published: number;
    draft: number;
  };
  media: {
    total: number;
  };
}

export interface IRecentItem {
  id: string;
  title: string;
  contentType: 'post' | 'poem';
  status: ContentStatus;
  updatedAt: Date;
}
