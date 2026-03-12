import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError } from '@shared/types';
import { Post } from '@modules/post/entities/post.entity';
import { Poem } from '@modules/poem/entities/poem.entity';
import { MediaAsset } from '@modules/media/entities/media-asset.entity';
import { IDashboardStats, IRecentItem } from './interfaces/dashboard.interfaces';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Poem)
    private readonly poemRepo: Repository<Poem>,
    @InjectRepository(MediaAsset)
    private readonly mediaRepo: Repository<MediaAsset>,
  ) {}

  async getStats(): Promise<Result<IDashboardStats, DomainError>> {
    try {
      const [postTotal, postPublished, postDraft, postArchived] =
        await Promise.all([
          this.postRepo.count(),
          this.postRepo.count({ where: { status: 'published' } }),
          this.postRepo.count({ where: { status: 'draft' } }),
          this.postRepo.count({ where: { status: 'archived' } }),
        ]);

      const [poemTotal, poemPublished, poemDraft] = await Promise.all([
        this.poemRepo.count(),
        this.poemRepo.count({ where: { status: 'published' } }),
        this.poemRepo.count({ where: { status: 'draft' } }),
      ]);

      const mediaTotal = await this.mediaRepo.count();

      return ok({
        posts: {
          total: postTotal,
          published: postPublished,
          draft: postDraft,
          archived: postArchived,
        },
        poems: {
          total: poemTotal,
          published: poemPublished,
          draft: poemDraft,
        },
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
      const [recentPosts, recentPoems] = await Promise.all([
        this.postRepo.find({
          select: ['id', 'title', 'status', 'updatedAt'],
          order: { updatedAt: 'DESC' },
          take: 10,
        }),
        this.poemRepo.find({
          select: ['id', 'title', 'status', 'updatedAt'],
          order: { updatedAt: 'DESC' },
          take: 10,
        }),
      ]);

      const items: IRecentItem[] = [
        ...recentPosts.map((p) => ({
          id: p.id as string,
          title: p.title,
          contentType: 'post' as const,
          status: p.status,
          updatedAt: p.updatedAt,
        })),
        ...recentPoems.map((p) => ({
          id: p.id as string,
          title: p.title,
          contentType: 'poem' as const,
          status: p.status,
          updatedAt: p.updatedAt,
        })),
      ];

      items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return ok(items.slice(0, 10));
    } catch {
      return err({
        kind: 'external_service' as const,
        service: 'database',
        message: 'Failed to fetch recent items',
      });
    }
  }
}
