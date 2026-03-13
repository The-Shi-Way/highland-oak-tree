import {
  Controller,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { LeafType, getErrorMessage } from '@shared/types';
import { SeoService } from './seo.service';

const VALID_LEAF_TYPES: readonly string[] = ['prose', 'blossom', 'fruit', 'seed'];

@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response): Promise<void> {
    const result = await this.seoService.generateSitemap();
    if (!result.ok) {
      throw new HttpException(getErrorMessage(result.error), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(result.value.xml);
  }

  @Get('feed')
  async getMainFeed(@Res() res: Response): Promise<void> {
    const result = await this.seoService.generateMainFeed();
    if (!result.ok) {
      throw new HttpException(getErrorMessage(result.error), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(result.value.xml);
  }

  @Get(':leafType/feed')
  async getBranchFeed(
    @Param('leafType') leafType: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!VALID_LEAF_TYPES.includes(leafType)) {
      throw new HttpException('Invalid leaf type', HttpStatus.NOT_FOUND);
    }

    const result = await this.seoService.generateBranchFeed(leafType as LeafType);
    if (!result.ok) {
      throw new HttpException(getErrorMessage(result.error), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(result.value.xml);
  }

  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(this.seoService.getRobotsTxt());
  }
}
