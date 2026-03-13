import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeavesAndGrove1710000005 implements MigrationInterface {
  name = 'CreateLeavesAndGrove1710000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums for the leaf model
    await queryRunner.query(`
      CREATE TYPE leaf_type AS ENUM ('prose', 'blossom', 'fruit', 'seed')
    `);
    await queryRunner.query(`
      CREATE TYPE season AS ENUM ('spring', 'summer', 'autumn', 'winter')
    `);
    await queryRunner.query(`
      CREATE TYPE growth_stage AS ENUM ('seedling', 'sapling', 'mature', 'evergreen')
    `);

    // Create leaves table
    await queryRunner.query(`
      CREATE TABLE leaves (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(300) NOT NULL UNIQUE,
        body JSONB NOT NULL DEFAULT '{}',
        excerpt VARCHAR(500),
        featured_image VARCHAR(500),
        leaf_type leaf_type NOT NULL,
        season season NOT NULL,
        growth growth_stage NOT NULL DEFAULT 'seedling',
        vines TEXT[] NOT NULL DEFAULT '{}',
        status content_status NOT NULL DEFAULT 'draft',
        is_forest_floor BOOLEAN NOT NULL DEFAULT false,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Indexes on leaves
    await queryRunner.query(`
      CREATE INDEX idx_leaves_status_published_at ON leaves (status, published_at DESC NULLS LAST)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_leaves_leaf_type_status ON leaves (leaf_type, status)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_leaves_season ON leaves (season, status)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_leaves_is_forest_floor ON leaves (is_forest_floor, published_at DESC NULLS LAST)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_leaves_vines ON leaves USING GIN (vines)
    `);

    // Create grove_entries table
    await queryRunner.query(`
      CREATE TABLE grove_entries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        tree_label VARCHAR(100) NOT NULL DEFAULT '',
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_grove_entries_display_order ON grove_entries (display_order ASC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS grove_entries`);
    await queryRunner.query(`DROP TABLE IF EXISTS leaves`);
    await queryRunner.query(`DROP TYPE IF EXISTS growth_stage`);
    await queryRunner.query(`DROP TYPE IF EXISTS season`);
    await queryRunner.query(`DROP TYPE IF EXISTS leaf_type`);
  }
}
