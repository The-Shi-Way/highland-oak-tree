import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError, GroveEntryId } from '@shared/types';

import { GroveEntry } from './entities/grove-entry.entity';
import { IGroveEntry, ICreateGroveEntry, IUpdateGroveEntry } from './interfaces/grove.interfaces';

@Injectable()
export class GroveService {
  private readonly logger = new Logger(GroveService.name);

  constructor(
    @InjectRepository(GroveEntry)
    private readonly groveRepo: Repository<GroveEntry>,
  ) {}

  async create(data: ICreateGroveEntry): Promise<Result<IGroveEntry, DomainError>> {
    if (!data.name.trim()) {
      return err({ kind: 'validation', message: 'Name cannot be empty', field: 'name' });
    }
    if (!data.url.trim()) {
      return err({ kind: 'validation', message: 'URL cannot be empty', field: 'url' });
    }

    const entry = this.groveRepo.create({
      name: data.name,
      url: data.url,
      description: data.description ?? '',
      treeLabel: data.treeLabel ?? '',
      displayOrder: data.displayOrder ?? 0,
    });

    const saved = await this.groveRepo.save(entry);
    return ok(this.toGroveEntry(saved));
  }

  async update(id: GroveEntryId, data: IUpdateGroveEntry): Promise<Result<IGroveEntry, DomainError>> {
    const entry = await this.groveRepo.findOne({ where: { id } });
    if (!entry) {
      return err({ kind: 'not_found', entity: 'GroveEntry', id });
    }

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return err({ kind: 'validation', message: 'Name cannot be empty', field: 'name' });
      }
      entry.name = data.name;
    }
    if (data.url !== undefined) {
      if (!data.url.trim()) {
        return err({ kind: 'validation', message: 'URL cannot be empty', field: 'url' });
      }
      entry.url = data.url;
    }
    if (data.description !== undefined) entry.description = data.description;
    if (data.treeLabel !== undefined) entry.treeLabel = data.treeLabel;
    if (data.displayOrder !== undefined) entry.displayOrder = data.displayOrder;

    const saved = await this.groveRepo.save(entry);
    return ok(this.toGroveEntry(saved));
  }

  async delete(id: GroveEntryId): Promise<Result<void, DomainError>> {
    const entry = await this.groveRepo.findOne({ where: { id } });
    if (!entry) {
      return err({ kind: 'not_found', entity: 'GroveEntry', id });
    }

    await this.groveRepo.remove(entry);
    return ok(undefined);
  }

  async listAll(): Promise<IGroveEntry[]> {
    const entries = await this.groveRepo.find({
      order: { displayOrder: 'ASC' },
    });
    return entries.map((e) => this.toGroveEntry(e));
  }

  async findById(id: GroveEntryId): Promise<Result<IGroveEntry, DomainError>> {
    const entry = await this.groveRepo.findOne({ where: { id } });
    if (!entry) {
      return err({ kind: 'not_found', entity: 'GroveEntry', id });
    }
    return ok(this.toGroveEntry(entry));
  }

  private toGroveEntry(entity: GroveEntry): IGroveEntry {
    return {
      id: entity.id,
      name: entity.name,
      url: entity.url,
      description: entity.description,
      treeLabel: entity.treeLabel,
      displayOrder: entity.displayOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
