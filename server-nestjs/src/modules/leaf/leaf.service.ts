import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError, LeafId, LeafType, Season, GrowthStage } from '@shared/types';
import { generateSlug } from '@shared/utils/slug';
import { computeSeason } from '@shared/utils/season';

import { Leaf } from './entities/leaf.entity';
import { ILeaf, ICreateLeaf, IUpdateLeaf, ILeafListResult } from './interfaces/leaf.interfaces';

@Injectable()
export class LeafService {
  private readonly logger = new Logger(LeafService.name);

  constructor(
    @InjectRepository(Leaf)
    private readonly leafRepo: Repository<Leaf>,
  ) {}

  async create(data: ICreateLeaf): Promise<Result<ILeaf, DomainError>> {
    if (!data.title.trim()) {
      return err({ kind: 'validation', message: 'Title cannot be empty', field: 'title' });
    }

    const existingSlugs = await this.leafRepo
      .createQueryBuilder('leaf')
      .select('leaf.slug')
      .getMany()
      .then((leaves) => leaves.map((l) => l.slug));

    const slug = generateSlug(data.title, existingSlugs);
    const now = new Date();

    const leaf = this.leafRepo.create({
      title: data.title,
      slug,
      body: data.body,
      leafType: data.leafType,
      growth: data.growth ?? 'seedling',
      season: computeSeason(now),
      vines: data.vines ?? [],
      excerpt: data.excerpt ?? null,
      featuredImage: data.featuredImage ?? null,
      status: 'draft',
      isForestFloor: false,
    });

    const saved = await this.leafRepo.save(leaf);
    return ok(this.toLeaf(saved));
  }

  async update(id: LeafId, data: IUpdateLeaf): Promise<Result<ILeaf, DomainError>> {
    const leaf = await this.leafRepo.findOne({ where: { id } });
    if (!leaf) {
      return err({ kind: 'not_found', entity: 'Leaf', id });
    }

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        return err({ kind: 'validation', message: 'Title cannot be empty', field: 'title' });
      }
      leaf.title = data.title;
    }
    if (data.body !== undefined) leaf.body = data.body;
    if (data.leafType !== undefined) leaf.leafType = data.leafType;
    if (data.growth !== undefined) leaf.growth = data.growth;
    if (data.vines !== undefined) leaf.vines = data.vines;
    if (data.excerpt !== undefined) leaf.excerpt = data.excerpt;
    if (data.featuredImage !== undefined) leaf.featuredImage = data.featuredImage;

    const saved = await this.leafRepo.save(leaf);
    return ok(this.toLeaf(saved));
  }

  async publish(id: LeafId): Promise<Result<ILeaf, DomainError>> {
    const leaf = await this.leafRepo.findOne({ where: { id } });
    if (!leaf) {
      return err({ kind: 'not_found', entity: 'Leaf', id });
    }
    if (leaf.status === 'published') {
      return err({ kind: 'conflict', message: 'Leaf is already published' });
    }

    const now = new Date();
    leaf.status = 'published';
    leaf.publishedAt = now;
    leaf.season = computeSeason(now);

    const saved = await this.leafRepo.save(leaf);
    return ok(this.toLeaf(saved));
  }

  async unpublish(id: LeafId): Promise<Result<ILeaf, DomainError>> {
    const leaf = await this.leafRepo.findOne({ where: { id } });
    if (!leaf) {
      return err({ kind: 'not_found', entity: 'Leaf', id });
    }
    if (leaf.status !== 'published') {
      return err({ kind: 'conflict', message: 'Leaf is not published' });
    }

    leaf.status = 'draft';
    leaf.publishedAt = null;

    const saved = await this.leafRepo.save(leaf);
    return ok(this.toLeaf(saved));
  }

  async softDelete(id: LeafId): Promise<Result<ILeaf, DomainError>> {
    const leaf = await this.leafRepo.findOne({ where: { id } });
    if (!leaf) {
      return err({ kind: 'not_found', entity: 'Leaf', id });
    }

    leaf.status = 'archived';
    const saved = await this.leafRepo.save(leaf);
    return ok(this.toLeaf(saved));
  }

  async findBySlug(slug: string): Promise<Result<ILeaf, DomainError>> {
    const leaf = await this.leafRepo.findOne({ where: { slug, status: 'published' } });
    if (!leaf) {
      return err({ kind: 'not_found', entity: 'Leaf', id: slug });
    }
    return ok(this.toLeaf(leaf));
  }

  async findById(id: LeafId): Promise<Result<ILeaf, DomainError>> {
    const leaf = await this.leafRepo.findOne({ where: { id } });
    if (!leaf) {
      return err({ kind: 'not_found', entity: 'Leaf', id });
    }
    return ok(this.toLeaf(leaf));
  }

  async listByBranch(
    leafType: LeafType,
    page: number,
    limit: number,
    season?: Season,
    growth?: GrowthStage,
    vine?: string,
  ): Promise<ILeafListResult> {
    const qb = this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .andWhere('leaf.leafType = :leafType', { leafType })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST');

    if (season) {
      qb.andWhere('leaf.season = :season', { season });
    }
    if (growth) {
      qb.andWhere('leaf.growth = :growth', { growth });
    }
    if (vine) {
      qb.andWhere(':vine = ANY(leaf.vines)', { vine });
    }

    const total = await qb.getCount();
    const leaves = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      leaves: leaves.map((l) => this.toLeaf(l)),
      total,
      page,
      limit,
    };
  }

  async listByVine(vine: string, page: number, limit: number): Promise<ILeafListResult> {
    const qb = this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .andWhere(':vine = ANY(leaf.vines)', { vine })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST');

    const total = await qb.getCount();
    const leaves = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      leaves: leaves.map((l) => this.toLeaf(l)),
      total,
      page,
      limit,
    };
  }

  async listForestFloor(page: number, limit: number): Promise<ILeafListResult> {
    const qb = this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .andWhere('leaf.isForestFloor = :ff', { ff: true })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST');

    const total = await qb.getCount();
    const leaves = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      leaves: leaves.map((l) => this.toLeaf(l)),
      total,
      page,
      limit,
    };
  }

  async listCanopy(
    page: number,
    limit: number,
    leafType?: LeafType,
    season?: Season,
    growth?: GrowthStage,
    vine?: string,
  ): Promise<ILeafListResult> {
    const qb = this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST');

    if (leafType) {
      qb.andWhere('leaf.leafType = :leafType', { leafType });
    }
    if (season) {
      qb.andWhere('leaf.season = :season', { season });
    }
    if (growth) {
      qb.andWhere('leaf.growth = :growth', { growth });
    }
    if (vine) {
      qb.andWhere(':vine = ANY(leaf.vines)', { vine });
    }

    const total = await qb.getCount();
    const leaves = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      leaves: leaves.map((l) => this.toLeaf(l)),
      total,
      page,
      limit,
    };
  }

  async listForTrunk(page: number, limit: number): Promise<{ feed: ILeafListResult; seeds: ILeaf[] }> {
    // Main feed: all published leaves
    const feedQb = this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST');

    const total = await feedQb.getCount();
    const feedLeaves = await feedQb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Seed sidebar: recent seeds (top 5)
    const seedLeaves = await this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .andWhere('leaf.leafType = :type', { type: 'seed' })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST')
      .take(5)
      .getMany();

    return {
      feed: {
        leaves: feedLeaves.map((l) => this.toLeaf(l)),
        total,
        page,
        limit,
      },
      seeds: seedLeaves.map((l) => this.toLeaf(l)),
    };
  }

  async findRelatedByVines(leafId: LeafId, limitCount: number = 5): Promise<ILeaf[]> {
    const leaf = await this.leafRepo.findOne({ where: { id: leafId } });
    if (!leaf || leaf.vines.length === 0) {
      return [];
    }

    const qb = this.leafRepo
      .createQueryBuilder('leaf')
      .where('leaf.status = :status', { status: 'published' })
      .andWhere('leaf.id != :id', { id: leafId })
      .andWhere('leaf.vines && :vines', { vines: leaf.vines })
      .orderBy('leaf.publishedAt', 'DESC', 'NULLS LAST')
      .take(limitCount);

    const related = await qb.getMany();
    return related.map((l) => this.toLeaf(l));
  }

  async listAll(page: number, limit: number): Promise<ILeafListResult> {
    const [leaves, total] = await this.leafRepo.findAndCount({
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      leaves: leaves.map((l) => this.toLeaf(l)),
      total,
      page,
      limit,
    };
  }

  /**
   * Used by ForestFloorScheduler to bulk-update the isForestFloor flag.
   */
  async updateForestFloorFlags(now: Date): Promise<void> {
    const threshold = new Date(now);
    threshold.setMonth(threshold.getMonth() - 12);

    await this.leafRepo
      .createQueryBuilder()
      .update(Leaf)
      .set({ isForestFloor: true })
      .where('status = :status', { status: 'published' })
      .andWhere('publishedAt < :threshold', { threshold })
      .execute();

    await this.leafRepo
      .createQueryBuilder()
      .update(Leaf)
      .set({ isForestFloor: false })
      .where('status = :status', { status: 'published' })
      .andWhere('publishedAt >= :threshold', { threshold })
      .execute();
  }

  private toLeaf(entity: Leaf): ILeaf {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      body: entity.body,
      excerpt: entity.excerpt,
      featuredImage: entity.featuredImage,
      leafType: entity.leafType,
      season: entity.season,
      growth: entity.growth,
      vines: entity.vines,
      status: entity.status,
      isForestFloor: entity.isForestFloor,
      publishedAt: entity.publishedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
