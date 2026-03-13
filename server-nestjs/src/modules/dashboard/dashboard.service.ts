import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError, LeafType } from '@shared/types';
import { Leaf } from '@modules/leaf/entities/leaf.entity';
import { MediaAsset } from '@modules/media/entities/media-asset.entity';
import { IDashboardStats, IRecentItem } from './interfaces/dashboard.interfaces';

const LEAF_TYPES: readonly LeafType[] = ['prose', 'blossom', 'fruit', 'seed'] as const;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Leaf)
    private readonly leafRepo: Repository<Leaf>,
    @InjectRepository(MediaAsset)
    private readonly mediaRepo: Repository<MediaAsset>,
  ) {}

  async getStats(): Promise<Result<IDashboardStats, DomainError>> {
    try {
      const [total, published, draft, archived] = await Promise.all([
        this.leafRepo.count(),
        this.leafRepo.count({ where: { status: 'published' } }),
        this.leafRepo.count({ where: { status: 'draft' } }),
        this.leafRepo.count({ where: { status: 'archived' } }),
      ]);

      const byTypeEntries = await Promise.all(
        LEAF_TYPES.map(async (lt) => {
          const count = await this.leafRepo.count({ where: { leafType: lt } });
          return [lt, count] as const;
        }),
      );
      const byType = Object.fromEntries(byTypeEntries) as Record<LeafType, number>;

      const mediaTotal = await this.mediaRepo.count();

      return ok({
        leaves: { total, published, draft, archived, byType },
        media: { total: mediaTotal },
      });
    } catch {
      return err({
        kind: 'external_service' as const,
        service: 'database',
        message: 'Failed to aggregate dashboard stats',
      });
    }
  }

  async getRecentItems(): Promise<Result<IRecentItem[], DomainError>> {
    try {
      const recentLeaves = await this.leafRepo.find({
        select: ['id', 'title', 'leafType', 'status', 'updatedAt'],
        order: { updatedAt: 'DESC' },
        take: 10,
      });

      const items: IRecentItem[] = recentLeaves.map((leaf) => ({
        id: leaf.id as string,
        title: leaf.title,
        leafType: leaf.leafType,
        status: leaf.status,
        updatedAt: leaf.updatedAt,
      }));

      return ok(items);
    } catch {
      return err({
        kind: 'external_service' as const,
        service: 'database',
        message: 'Failed to fetch recent items',
      });
    }
  }
}
