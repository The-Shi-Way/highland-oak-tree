import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { ChirpId } from '@shared/types';

/**
 * Chirp entity — table: chirps
 * A short-form announcement displayed on the bulletin board.
 * Represents birds chirping news from the Highland Oak Tree.
 */
@Entity('chirps')
@Index('idx_chirps_status_pinned_published', ['status', 'isPinned', 'publishedAt'])
@Index('idx_chirps_expires_at', ['expiresAt'])
export class Chirp {
  @PrimaryGeneratedColumn('uuid')
  id!: ChirpId;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'varchar', length: 500 })
  body!: string;

  @Column({ type: 'boolean', default: false })
  isPinned!: boolean;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
