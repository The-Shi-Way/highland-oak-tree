import { MediaAssetId } from '@shared/types';
import { AssetType, IThumbnails } from '../entities/media-asset.entity';

export interface IMediaAsset {
  id: MediaAssetId;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  cdnUrl: string;
  thumbnails: IThumbnails | null;
  assetType: AssetType;
  createdAt: Date;
}

export interface IUploadResult {
  asset: IMediaAsset;
}

export interface IMediaValidation {
  assetType: AssetType;
}
