import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { MediaAssetId } from '@shared/types';

export type AssetType = 'image' | 'video' | 'audio' | 'document';

export interface IThumbnails {
  small: string;
  medium: string;
  large: string;
}

/**
 * MediaAsset entity — table: media_assets
 * Represents an uploaded file stored in S3 with optional thumbnails.
 */
@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id!: MediaAssetId;

  @Column({ type: 'varchar', length: 255 })
  originalFilename!: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  fileSize!: number;

  @Column({ type: 'varchar', length: 500 })
  s3Key!: string;

  @Column({ type: 'varchar', length: 500 })
  cdnUrl!: string;

  @Column({ type: 'jsonb', nullable: true })
  thumbnails!: IThumbnails | null;

  @Column({ type: 'varchar', length: 20 })
  assetType!: AssetType;

  @CreateDateColumn()
  createdAt!: Date;
}
