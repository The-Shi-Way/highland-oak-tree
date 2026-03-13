import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Result, ok, err, DomainError } from '@shared/types';
import { generateSlug } from '@shared/utils/slug';
import { computeSeason } from '@shared/utils/season';

import { Leaf } from './entities/leaf.entity';
import { Post } from '../post/entities/post.entity';
import { Poem } from '../poem/entities/poem.entity';

export interface IMigrationResult {
  postsCount: number;
  poemsCount: number;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectRepository(Leaf)
    private readonly leafRepo: Repository<Leaf>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Poem)
    private readonly poemRepo: Repository<Poem>,
    private readonly dataSource: DataSource,
  ) {}

  async migrate(): Promise<Result<IMigrationResult, DomainError>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const posts = await this.postRepo.find();
      const poems = await this.poemRepo.find();

      // Collect all existing leaf slugs for collision detection
      const existingSlugs = await this.leafRepo
        .createQueryBuilder('leaf')
        .select('leaf.slug')
        .getMany()
        .then((leaves) => leaves.map((l) => l.slug));

      const allSlugs = [...existingSlugs];
      let postsCount = 0;
      let poemsCount = 0;

      // Migrate Posts → prose Leaves
      for (const post of posts) {
        const dateForSeason = post.publishedAt ?? post.createdAt;
        const season = computeSeason(dateForSeason);
        const growth = post.status === 'published' ? 'mature' : 'seedling';

        // Post already has a slug, but check for collision with existing leaves
        let slug = post.slug;
        if (allSlugs.includes(slug)) {
          let suffix = 1;
          while (allSlugs.includes(`${slug}-${suffix}`)) {
            suffix++;
          }
          slug = `${slug}-${suffix}`;
        }
        allSlugs.push(slug);

        const leaf = queryRunner.manager.create(Leaf, {
          title: post.title,
          slug,
          body: post.body,
          excerpt: post.excerpt,
          featuredImage: post.coverImageUrl,
          leafType: 'prose',
          season,
          growth,
          vines: post.tags,
          status: post.status,
          isForestFloor: false,
          publishedAt: post.publishedAt,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        } as Partial<Leaf>);

        await queryRunner.manager.save(leaf);
        postsCount++;
      }

      // Migrate Poems → blossom Leaves
      for (const poem of poems) {
        const dateForSeason = poem.publishedAt ?? poem.createdAt;
        const season = computeSeason(dateForSeason);
        const growth = poem.status === 'published' ? 'mature' : 'seedling';

        const slug = generateSlug(poem.title, allSlugs);
        allSlugs.push(slug);

        const leaf = queryRunner.manager.create(Leaf, {
          title: poem.title,
          slug,
          body: poem.body,
          excerpt: null,
          featuredImage: null,
          leafType: 'blossom',
          season,
          growth,
          vines: [],
          status: poem.status,
          isForestFloor: false,
          publishedAt: poem.publishedAt,
          createdAt: poem.createdAt,
          updatedAt: poem.updatedAt,
        } as Partial<Leaf>);

        await queryRunner.manager.save(leaf);
        poemsCount++;
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Migration complete: ${postsCount} posts, ${poemsCount} poems`);

      return ok({ postsCount, poemsCount });
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const message = error instanceof Error ? error.message : 'Unknown migration error';
      this.logger.error(`Migration failed: ${message}`);
      return err({ kind: 'external_service', service: 'MigrationService', message });
    } finally {
      await queryRunner.release();
    }
  }
}
