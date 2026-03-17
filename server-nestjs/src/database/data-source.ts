import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'highland',
  password: process.env.DB_PASSWORD ?? 'highland_dev',
  database: process.env.DB_NAME ?? 'highland_oak_tree',
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  migrations: ['dist/database/migrations/*.js'],
  logging: true,
});
