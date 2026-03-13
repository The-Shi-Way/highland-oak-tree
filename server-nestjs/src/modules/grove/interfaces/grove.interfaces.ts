import { GroveEntryId } from '@shared/types';

export interface IGroveEntry {
  id: GroveEntryId;
  name: string;
  url: string;
  description: string;
  treeLabel: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateGroveEntry {
  name: string;
  url: string;
  description?: string;
  treeLabel?: string;
  displayOrder?: number;
}

export interface IUpdateGroveEntry {
  name?: string;
  url?: string;
  description?: string;
  treeLabel?: string;
  displayOrder?: number;
}
