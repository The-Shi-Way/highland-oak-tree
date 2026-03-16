import { ChirpId } from '@shared/types';

export type ChirpStatus = 'draft' | 'published';

export interface IChirp {
  id: ChirpId;
  title: string;
  body: string;
  isPinned: boolean;
  status: ChirpStatus;
  expiresAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateChirp {
  title: string;
  body: string;
  expiresAt?: Date;
}

export interface IUpdateChirp {
  title?: string;
  body?: string;
  expiresAt?: Date | null;
}

export interface IChirpListResult {
  chirps: IChirp[];
  total: number;
  page: number;
  limit: number;
}
