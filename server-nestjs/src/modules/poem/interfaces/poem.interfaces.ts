import { ContentStatus, PoemId } from '@shared/types';

export interface IPoem {
  id: PoemId;
  title: string;
  body: Record<string, unknown>;
  status: ContentStatus;
  theme: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface ICreatePoem {
  title: string;
  body: Record<string, unknown>;
  theme?: string;
}

export interface IUpdatePoem {
  title?: string;
  body?: Record<string, unknown>;
  theme?: string;
  displayOrder?: number;
}
