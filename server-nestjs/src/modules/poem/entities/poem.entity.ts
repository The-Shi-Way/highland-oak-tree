import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ContentStatus, PoemId } from '@shared/types';

/**
 * Poem entity — table: poems
 * Represents a poem with creative theme rendering on the poetry page.
 */
@Entity('poems')
export class Poem {
  @PrimaryGeneratedColumn('uuid')
  id!: PoemId;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'jsonb' })
  body!: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status!: ContentStatus;

  @Column({ type: 'varchar', length: 50, default: 'classic' })
  theme!: string;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;
}
