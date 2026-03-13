import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { PoemModule } from './modules/poem/poem.module';
import { MediaModule } from './modules/media/media.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SeoModule } from './modules/seo/seo.module';
import { LeafModule } from './modules/leaf/leaf.module';
import { GroveModule } from './modules/grove/grove.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    AuthModule,
    PostModule,   // Kept temporarily for migration source access
    PoemModule,   // Kept temporarily for migration source access
    LeafModule,
    GroveModule,
    MediaModule,
    AiAssistantModule,
    SearchModule,
    DashboardModule,
    SeoModule,
  ],
})
export class AppModule {}
