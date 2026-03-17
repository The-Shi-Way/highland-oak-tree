import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePoems1710000003000 implements MigrationInterface {
  name = 'CreatePoems1710000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE poems (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body JSONB NOT NULL DEFAULT '{}',
        status content_status NOT NULL DEFAULT 'draft',
        theme VARCHAR(50) NOT NULL DEFAULT 'classic',
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        published_at TIMESTAMP WITH TIME ZONE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_poems_status ON poems (status)`);
    await queryRunner.query(`CREATE INDEX idx_poems_display_order ON poems (display_order)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS poems`);
  }
}
