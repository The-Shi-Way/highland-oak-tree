import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@modules/auth/auth.module';
import { Poem } from './entities/poem.entity';
import { PoemService } from './poem.service';
import { PoemController } from './poem.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Poem]), AuthModule],
  controllers: [PoemController],
  providers: [PoemService],
  exports: [PoemService],
})
export class PoemModule {}
