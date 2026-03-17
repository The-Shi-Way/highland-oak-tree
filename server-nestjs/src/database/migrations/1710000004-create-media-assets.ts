import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaAssets1710000004000 implements MigrationInterface {
  name = 'CreateMediaAssets1710000004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE media_assets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        original_filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        s3_key VARCHAR(500) NOT NULL,
        cdn_url VARCHAR(500) NOT NULL,
        thumbnails JSONB,
        asset_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_media_assets_type ON media_assets (asset_type)`);

    // Join tables for post-media and poem-media associations
    await queryRunner.query(`
      CREATE TABLE post_media (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, media_asset_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE poem_media (
        poem_id UUID NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
        media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
        PRIMARY KEY (poem_id, media_asset_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS poem_media`);
    await queryRunner.query(`DROP TABLE IF EXISTS post_media`);
    await queryRunner.query(`DROP TABLE IF EXISTS media_assets`);
  }
}
