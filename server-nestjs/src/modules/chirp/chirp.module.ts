import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@modules/auth/auth.module';
import { Chirp } from './entities/chirp.entity';
import { ChirpService } from './chirp.service';
import { ChirpController } from './chirp.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chirp]), AuthModule],
  controllers: [ChirpController],
  providers: [ChirpService],
  exports: [ChirpService],
})
export class ChirpModule {}
