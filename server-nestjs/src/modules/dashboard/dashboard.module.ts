import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from '@modules/post/entities/post.entity';
import { Poem } from '@modules/poem/entities/poem.entity';
import { MediaAsset } from '@modules/media/entities/media-asset.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Poem, MediaAsset]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
