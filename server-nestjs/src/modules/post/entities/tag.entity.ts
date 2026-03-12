import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Tag entity — table: tags
 * Used for categorizing and filtering posts.
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;
}
