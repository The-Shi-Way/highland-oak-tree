import { ContentStatus, PostId } from '@shared/types';

export interface IPost {
  id: PostId;
  title: string;
  slug: string;
  body: Record<string, unknown>;
  status: ContentStatus;
  tags: string[];
  excerpt: string | null;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface ICreatePost {
  title: string;
  body: Record<string, unknown>;
  tags?: string[];
  excerpt?: string;
  coverImageUrl?: string;
}

export interface IUpdatePost {
  title?: string;
  body?: Record<string, unknown>;
  tags?: string[];
  excerpt?: string | null;
  coverImageUrl?: string | null;
}

export interface IPostListQuery {
  page: number;
  limit: number;
  tag?: string;
  status?: ContentStatus;
}

export interface IPostListResult {
  posts: IPost[];
  total: number;
  page: number;
  limit: number;
}
