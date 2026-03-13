import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import {
  ContentStatus,
  LeafId,
  LeafType,
  Season,
  GrowthStage,
} from '@shared/types';

/**
 * Leaf entity — table: leaves
 * Unified content model replacing separate Post and Poem entities.
 * Every piece of content is a "leaf" on the Highland Oak Tree.
 */
@Entity('leaves')
@Index('idx_leaves_status_published_at', ['status', 'publishedAt'])
@Index('idx_leaves_leaf_type_status', ['leafType', 'status'])
@Index('idx_leaves_season', ['season', 'status'])
@Index('idx_leaves_is_forest_floor', ['isForestFloor', 'publishedAt'])
export class Leaf {
  @PrimaryGeneratedColumn('uuid')
  id!: LeafId;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'jsonb' })
  body!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  featuredImage!: string | null;

  @Column({
    type: 'enum',
    enum: ['prose', 'blossom', 'fruit', 'seed'],
  })
  leafType!: LeafType;

  @Column({
    type: 'enum',
    enum: ['spring', 'summer', 'autumn', 'winter'],
  })
  season!: Season;

  @Column({
    type: 'enum',
    enum: ['seedling', 'sapling', 'mature', 'evergreen'],
    default: 'seedling',
  })
  growth!: GrowthStage;

  @Column('text', { array: true, default: '{}' })
  vines!: string[];

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status!: ContentStatus;

  @Column({ type: 'boolean', default: false })
  isForestFloor!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
