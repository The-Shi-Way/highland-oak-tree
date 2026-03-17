import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function runMigrations(): Promise<void> {
  const logger = new Logger('Migrations');

  if (process.env.NODE_ENV !== 'production') {
    logger.log('Skipping migrations in non-production (synchronize handles schema)');
    return;
  }

  logger.log('Running database migrations...');
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'highland',
    password: process.env.DB_PASSWORD ?? 'highland_dev',
    database: process.env.DB_NAME ?? 'highland_oak_tree',
    ssl: { rejectUnauthorized: false },
    migrations: [__dirname + '/database/migrations/*.js'],
    logging: true,
  });

  await dataSource.initialize();
  const migrations = await dataSource.runMigrations();
  logger.log(`Executed ${migrations.length} migration(s)`);
  await dataSource.destroy();
  logger.log('Migrations complete');
}

async function bootstrap(): Promise<void> {
  await runMigrations();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('The Highland Oak Tree API')
    .setDescription('API for The Highland Oak Tree — a personal blog by an AI engineer & consultant')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

bootstrap();
