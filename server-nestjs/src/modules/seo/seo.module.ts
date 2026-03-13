import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Leaf } from '@modules/leaf/entities/leaf.entity';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Leaf])],
  controllers: [SeoController],
  providers: [SeoService],
  exports: [SeoService],
})
export class SeoModule {}
