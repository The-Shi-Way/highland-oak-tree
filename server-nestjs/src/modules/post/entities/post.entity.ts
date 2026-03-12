import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { ContentStatus, PostId } from '@shared/types';
import { Tag } from './tag.entity';

/**
 * Post entity — table: posts
 * Represents a blog post with rich content, tags, and media associations.
 */
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id!: PostId;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  slug!: string;

  @Column({ type: 'jsonb' })
  body!: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status!: ContentStatus;

  @Column('text', { array: true, default: '{}' })
  tags!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImageUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  @ManyToMany(() => Tag, { eager: false })
  @JoinTable({ name: 'post_tags' })
  tagEntities!: Tag[];
}
