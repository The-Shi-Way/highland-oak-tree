import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@modules/auth/auth.module';
import { Leaf } from './entities/leaf.entity';
import { Post } from '../post/entities/post.entity';
import { Poem } from '../poem/entities/poem.entity';
import { LeafService } from './leaf.service';
import { LeafController } from './leaf.controller';
import { ForestFloorScheduler } from './forest-floor.scheduler';
import { MigrationService } from './migration.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leaf, Post, Poem]), AuthModule],
  controllers: [LeafController],
  providers: [LeafService, ForestFloorScheduler, MigrationService],
  exports: [LeafService],
})
export class LeafModule {}
