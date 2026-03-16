import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError, ChirpId } from '@shared/types';

import { Chirp } from './entities/chirp.entity';
import { IChirp, ICreateChirp, IUpdateChirp, IChirpListResult, ChirpStatus } from './interfaces/chirp.interfaces';

@Injectable()
export class ChirpService {
  private readonly logger = new Logger(ChirpService.name);

  constructor(
    @InjectRepository(Chirp)
    private readonly chirpRepo: Repository<Chirp>,
  ) {}

  async create(data: ICreateChirp): Promise<Result<IChirp, DomainError>> {
    const titleError = this.validateTitle(data.title);
    if (titleError) return err(titleError);

    const bodyError = this.validateBody(data.body);
    if (bodyError) return err(bodyError);

    if (data.expiresAt !== undefined) {
      const expiryError = this.validateExpiresAt(data.expiresAt);
      if (expiryError) return err(expiryError);
    }

    const chirp = this.chirpRepo.create({
      title: data.title,
      body: data.body,
      isPinned: false,
      status: 'draft' as ChirpStatus,
      expiresAt: data.expiresAt ?? null,
      publishedAt: null,
      deletedAt: null,
    });

    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async update(id: ChirpId, data: IUpdateChirp): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }

    if (data.title !== undefined) {
      const titleError = this.validateTitle(data.title);
      if (titleError) return err(titleError);
      chirp.title = data.title;
    }

    if (data.body !== undefined) {
      const bodyError = this.validateBody(data.body);
      if (bodyError) return err(bodyError);
      chirp.body = data.body;
    }

    if (data.expiresAt !== undefined) {
      if (data.expiresAt === null) {
        chirp.expiresAt = null;
      } else {
        const expiryError = this.validateExpiresAt(data.expiresAt);
        if (expiryError) return err(expiryError);
        chirp.expiresAt = data.expiresAt;
      }
    }

    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async softDelete(id: ChirpId): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }

    chirp.deletedAt = new Date();
    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async findById(id: ChirpId): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }
    return ok(this.toChirp(chirp));
  }

  async publish(id: ChirpId): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }
    if (chirp.status === 'published') {
      return err({ kind: 'conflict', message: 'Chirp is already published' });
    }
    chirp.status = 'published';
    chirp.publishedAt = new Date();
    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async unpublish(id: ChirpId): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }
    if (chirp.status === 'draft') {
      return err({ kind: 'conflict', message: 'Chirp is already in draft status' });
    }
    chirp.status = 'draft';
    chirp.publishedAt = null;
    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async pin(id: ChirpId): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }
    chirp.isPinned = true;
    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async unpin(id: ChirpId): Promise<Result<IChirp, DomainError>> {
    const chirp = await this.chirpRepo.findOne({ where: { id } });
    if (!chirp) {
      return err({ kind: 'not_found', entity: 'Chirp', id });
    }
    chirp.isPinned = false;
    const saved = await this.chirpRepo.save(chirp);
    return ok(this.toChirp(saved));
  }

  async listActive(page: number, limit: number): Promise<IChirpListResult> {
    const qb = this.chirpRepo
      .createQueryBuilder('chirp')
      .where('chirp.status = :status', { status: 'published' })
      .andWhere('chirp.deletedAt IS NULL')
      .andWhere('(chirp.expiresAt IS NULL OR chirp.expiresAt > :now)', { now: new Date() })
      .orderBy('chirp.isPinned', 'DESC')
      .addOrderBy('chirp.publishedAt', 'DESC');

    const total = await qb.getCount();
    const chirps = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { chirps: chirps.map((c) => this.toChirp(c)), total, page, limit };
  }

  async listAll(page: number, limit: number): Promise<IChirpListResult> {
    const qb = this.chirpRepo
      .createQueryBuilder('chirp')
      .where('chirp.deletedAt IS NULL')
      .orderBy('chirp.createdAt', 'DESC');

    const total = await qb.getCount();
    const chirps = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { chirps: chirps.map((c) => this.toChirp(c)), total, page, limit };
  }

  private toChirp(entity: Chirp): IChirp {
    return {
      id: entity.id,
      title: entity.title,
      body: entity.body,
      isPinned: entity.isPinned,
      status: entity.status as ChirpStatus,
      expiresAt: entity.expiresAt,
      publishedAt: entity.publishedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private validateTitle(title: string): DomainError | null {
    if (!title.trim()) {
      return { kind: 'validation', message: 'Title cannot be empty or whitespace-only', field: 'title' };
    }
    if (title.length > 150) {
      return { kind: 'validation', message: 'Title must be at most 150 characters', field: 'title' };
    }
    return null;
  }

  private validateBody(body: string): DomainError | null {
    if (!body.trim()) {
      return { kind: 'validation', message: 'Body cannot be empty or whitespace-only', field: 'body' };
    }
    if (body.length > 500) {
      return { kind: 'validation', message: 'Body must be at most 500 characters', field: 'body' };
    }
    return null;
  }

  private validateExpiresAt(expiresAt: Date): DomainError | null {
    if (expiresAt.getTime() <= Date.now()) {
      return { kind: 'validation', message: 'Expiry date must be in the future', field: 'expiresAt' };
    }
    return null;
  }
}
