import {
  Controller,
  Get,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { SeoService } from './seo.service';
import { getErrorMessage } from '@shared/types';

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

  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(this.seoService.getRobotsTxt());
  }
}
