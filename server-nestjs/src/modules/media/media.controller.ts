import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { MediaAssetId } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';
import { MediaService } from './media.service';
import { IMediaAsset } from './interfaces/media.interfaces';

interface IMulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Media')
@Controller('media')
@UseGuards(CognitoGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a media file (admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: IMulterFile): Promise<IMediaAsset> {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    const result = await this.mediaService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
    );

    if (!result.ok) {
      const status =
        result.error.kind === 'validation' ? HttpStatus.BAD_REQUEST : HttpStatus.BAD_GATEWAY;
      throw new HttpException(result.error, status);
    }
    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'List all media assets (admin)' })
  async list(): Promise<IMediaAsset[]> {
    return this.mediaService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a media asset (admin)' })
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.mediaService.delete(id as MediaAssetId);
    if (!result.ok) {
      const status =
        result.error.kind === 'not_found' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_GATEWAY;
      throw new HttpException(result.error, status);
    }
  }
}
