import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { GroveEntryId } from '@shared/types';

/**
 * GroveEntry entity — table: grove_entries
 * Represents a blogroll entry — a neighboring tree in the grove.
 */
@Entity('grove_entries')
export class GroveEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: GroveEntryId;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 100 })
  treeLabel!: string;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
