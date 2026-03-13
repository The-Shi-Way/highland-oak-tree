import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Leaf } from '@modules/leaf/entities/leaf.entity';
import { MediaAsset } from '@modules/media/entities/media-asset.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leaf, MediaAsset]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
