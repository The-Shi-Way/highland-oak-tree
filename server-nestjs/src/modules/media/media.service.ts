import { randomUUID } from 'node:crypto';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { Result, ok, err, DomainError, MediaAssetId } from '@shared/types';
import { MediaAsset, AssetType } from './entities/media-asset.entity';
import { IMediaAsset } from './interfaces/media.interfaces';

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf'],
};

const ALL_ALLOWED = Object.values(ALLOWED_MIME_TYPES).flat();
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cdnBaseUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(MediaAsset)
    private readonly mediaRepo: Repository<MediaAsset>,
  ) {
    this.s3Client = new S3Client({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
    });
    this.bucket = this.config.get<string>('S3_MEDIA_BUCKET', 'highland-oak-tree-media');
    this.cdnBaseUrl = this.config.get<string>('CDN_BASE_URL', 'https://cdn.example.com');
  }

  validateUpload(mimeType: string, fileSize: number): Result<{ assetType: AssetType }, DomainError> {
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return err({
        kind: 'validation',
        message: `File size exceeds maximum of 50 MB`,
        field: 'file',
      });
    }

    if (!ALL_ALLOWED.includes(mimeType)) {
      return err({
        kind: 'validation',
        message: `File type ${mimeType} is not allowed. Allowed types: ${ALL_ALLOWED.join(', ')}`,
        field: 'file',
      });
    }

    const assetType = (Object.entries(ALLOWED_MIME_TYPES).find(([, types]) =>
      types.includes(mimeType),
    )?.[0] ?? 'document') as AssetType;

    return ok({ assetType });
  }

  async upload(
    file: Buffer,
    originalFilename: string,
    mimeType: string,
    fileSize: number,
  ): Promise<Result<IMediaAsset, DomainError>> {
    const validation = this.validateUpload(mimeType, fileSize);
    if (!validation.ok) return validation;

    const { assetType } = validation.value;
    const fileId = randomUUID();
    const ext = originalFilename.split('.').pop() ?? '';
    const s3Key = `media/${assetType}/${fileId}.${ext}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: file,
          ContentType: mimeType,
        }),
      );
    } catch (error: unknown) {
      this.logger.error('S3 upload failed', error);
      return err({
        kind: 'external_service',
        service: 'S3',
        message: 'Failed to upload file to storage',
      });
    }

    const cdnUrl = `${this.cdnBaseUrl}/${s3Key}`;

    // TODO: Generate thumbnails via Sharp for image assets
    const thumbnails =
      assetType === 'image'
        ? {
            small: `${this.cdnBaseUrl}/media/thumb/${fileId}-320.${ext}`,
            medium: `${this.cdnBaseUrl}/media/thumb/${fileId}-768.${ext}`,
            large: `${this.cdnBaseUrl}/media/thumb/${fileId}-1280.${ext}`,
          }
        : null;

    const entity = this.mediaRepo.create({
      originalFilename,
      mimeType,
      fileSize,
      s3Key,
      cdnUrl,
      thumbnails,
      assetType,
    });

    const saved = await this.mediaRepo.save(entity);
    return ok(this.toMediaAsset(saved));
  }

  async findAll(): Promise<IMediaAsset[]> {
    const assets = await this.mediaRepo.find({ order: { createdAt: 'DESC' } });
    return assets.map((a) => this.toMediaAsset(a));
  }

  async delete(id: MediaAssetId): Promise<Result<void, DomainError>> {
    const asset = await this.mediaRepo.findOne({ where: { id } });
    if (!asset) {
      return err({ kind: 'not_found', entity: 'MediaAsset', id });
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: asset.s3Key }),
      );
    } catch (error: unknown) {
      this.logger.error('S3 delete failed', error);
      return err({
        kind: 'external_service',
        service: 'S3',
        message: 'Failed to delete file from storage',
      });
    }

    await this.mediaRepo.remove(asset);
    return ok(undefined);
  }

  private toMediaAsset(entity: MediaAsset): IMediaAsset {
    return {
      id: entity.id,
      originalFilename: entity.originalFilename,
      mimeType: entity.mimeType,
      fileSize: entity.fileSize,
      s3Key: entity.s3Key,
      cdnUrl: entity.cdnUrl,
      thumbnails: entity.thumbnails,
      assetType: entity.assetType,
      createdAt: entity.createdAt,
    };
  }
}
