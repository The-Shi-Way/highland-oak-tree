import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@modules/auth/auth.module';
import { GroveEntry } from './entities/grove-entry.entity';
import { GroveService } from './grove.service';
import { GroveController } from './grove.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GroveEntry]), AuthModule],
  controllers: [GroveController],
  providers: [GroveService],
  exports: [GroveService],
})
export class GroveModule {}
