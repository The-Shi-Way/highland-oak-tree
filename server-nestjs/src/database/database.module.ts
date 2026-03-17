import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from './snake-naming.strategy';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'highland'),
        password: config.get<string>('DB_PASSWORD', 'highland_dev'),
        database: config.get<string>('DB_NAME', 'highland_oak_tree'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
        namingStrategy: new SnakeNamingStrategy(),
        ssl: config.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
  ],
})
export class DatabaseModule {}
