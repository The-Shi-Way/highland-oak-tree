import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError, PoemId } from '@shared/types';
import { Poem } from './entities/poem.entity';
import { IPoem, ICreatePoem, IUpdatePoem } from './interfaces/poem.interfaces';

@Injectable()
export class PoemService {
  private readonly logger = new Logger(PoemService.name);

  constructor(
    @InjectRepository(Poem)
    private readonly poemRepo: Repository<Poem>,
  ) {}

  async create(data: ICreatePoem): Promise<Result<IPoem, DomainError>> {
    if (!data.title.trim()) {
      return err({ kind: 'validation', message: 'Title cannot be empty', field: 'title' });
    }

    const poem = this.poemRepo.create({
      title: data.title,
      body: data.body,
      status: 'draft',
      theme: data.theme ?? 'classic',
    });

    const saved = await this.poemRepo.save(poem);
    return ok(this.toPoem(saved));
  }

  async update(id: PoemId, data: IUpdatePoem): Promise<Result<IPoem, DomainError>> {
    const poem = await this.poemRepo.findOne({ where: { id } });
    if (!poem) {
      return err({ kind: 'not_found', entity: 'Poem', id });
    }

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        return err({ kind: 'validation', message: 'Title cannot be empty', field: 'title' });
      }
      poem.title = data.title;
    }
    if (data.body !== undefined) poem.body = data.body;
    if (data.theme !== undefined) poem.theme = data.theme;
    if (data.displayOrder !== undefined) poem.displayOrder = data.displayOrder;

    const saved = await this.poemRepo.save(poem);
    return ok(this.toPoem(saved));
  }

  async publish(id: PoemId): Promise<Result<IPoem, DomainError>> {
    const poem = await this.poemRepo.findOne({ where: { id } });
    if (!poem) {
      return err({ kind: 'not_found', entity: 'Poem', id });
    }
    if (poem.status === 'published') {
      return err({ kind: 'conflict', message: 'Poem is already published' });
    }

    poem.status = 'published';
    poem.publishedAt = new Date();
    const saved = await this.poemRepo.save(poem);
    return ok(this.toPoem(saved));
  }

  async unpublish(id: PoemId): Promise<Result<IPoem, DomainError>> {
    const poem = await this.poemRepo.findOne({ where: { id } });
    if (!poem) {
      return err({ kind: 'not_found', entity: 'Poem', id });
    }
    if (poem.status !== 'published') {
      return err({ kind: 'conflict', message: 'Poem is not published' });
    }

    poem.status = 'draft';
    poem.publishedAt = null;
    const saved = await this.poemRepo.save(poem);
    return ok(this.toPoem(saved));
  }

  async softDelete(id: PoemId): Promise<Result<IPoem, DomainError>> {
    const poem = await this.poemRepo.findOne({ where: { id } });
    if (!poem) {
      return err({ kind: 'not_found', entity: 'Poem', id });
    }

    poem.status = 'archived';
    const saved = await this.poemRepo.save(poem);
    return ok(this.toPoem(saved));
  }

  async findById(id: PoemId): Promise<Result<IPoem, DomainError>> {
    const poem = await this.poemRepo.findOne({ where: { id } });
    if (!poem) {
      return err({ kind: 'not_found', entity: 'Poem', id });
    }
    return ok(this.toPoem(poem));
  }

  async findPublishedById(id: PoemId): Promise<Result<IPoem, DomainError>> {
    const poem = await this.poemRepo.findOne({ where: { id, status: 'published' } });
    if (!poem) {
      return err({ kind: 'not_found', entity: 'Poem', id });
    }
    return ok(this.toPoem(poem));
  }

  async listPublished(): Promise<IPoem[]> {
    const poems = await this.poemRepo.find({
      where: { status: 'published' },
      order: { displayOrder: 'ASC', publishedAt: 'DESC' },
    });
    return poems.map((p) => this.toPoem(p));
  }

  async listAll(): Promise<IPoem[]> {
    const poems = await this.poemRepo.find({
      order: { updatedAt: 'DESC' },
    });
    return poems.map((p) => this.toPoem(p));
  }

  private toPoem(entity: Poem): IPoem {
    return {
      id: entity.id,
      title: entity.title,
      body: entity.body,
      status: entity.status,
      theme: entity.theme,
      displayOrder: entity.displayOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      publishedAt: entity.publishedAt,
    };
  }
}
