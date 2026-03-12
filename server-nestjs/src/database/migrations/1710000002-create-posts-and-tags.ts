import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostsAndTags1710000002 implements MigrationInterface {
  name = 'CreatePostsAndTags1710000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create content_status enum
    await queryRunner.query(`
      CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived')
    `);

    // Create posts table
    await queryRunner.query(`
      CREATE TABLE posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(300) NOT NULL UNIQUE,
        body JSONB NOT NULL DEFAULT '{}',
        status content_status NOT NULL DEFAULT 'draft',
        tags TEXT[] NOT NULL DEFAULT '{}',
        excerpt VARCHAR(500),
        cover_image_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        published_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create indexes on posts
    await queryRunner.query(`CREATE INDEX idx_posts_slug ON posts (slug)`);
    await queryRunner.query(`CREATE INDEX idx_posts_status ON posts (status)`);
    await queryRunner.query(`CREATE INDEX idx_posts_published_at ON posts (published_at DESC NULLS LAST)`);

    // Create tags table
    await queryRunner.query(`
      CREATE TABLE tags (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    // Create post_tags join table
    await queryRunner.query(`
      CREATE TABLE post_tags (
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_post_tags_post_id ON post_tags (post_id)`);
    await queryRunner.query(`CREATE INDEX idx_post_tags_tag_id ON post_tags (tag_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS post_tags`);
    await queryRunner.query(`DROP TABLE IF EXISTS tags`);
    await queryRunner.query(`DROP TABLE IF EXISTS posts`);
    await queryRunner.query(`DROP TYPE IF EXISTS content_status`);
  }
}
