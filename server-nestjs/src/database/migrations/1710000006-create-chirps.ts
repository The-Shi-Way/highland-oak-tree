import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChirps1710000006 implements MigrationInterface {
  name = 'CreateChirps1710000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE chirps (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        body VARCHAR(500) NOT NULL,
        is_pinned BOOLEAN NOT NULL DEFAULT false,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        expires_at TIMESTAMP WITH TIME ZONE,
        published_at TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_chirps_status_pinned_published ON chirps (status, is_pinned, published_at)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_chirps_expires_at ON chirps (expires_at)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS chirps`);
  }
}
