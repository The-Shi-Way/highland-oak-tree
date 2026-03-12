import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Result, ok, err, DomainError, PostId } from '@shared/types';
import { generateSlug } from '@shared/utils/slug';
import { Post } from './entities/post.entity';
import { IPost, ICreatePost, IUpdatePost, IPostListResult } from './interfaces/post.interfaces';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(data: ICreatePost): Promise<Result<IPost, DomainError>> {
    if (!data.title.trim()) {
      return err({ kind: 'validation', message: 'Title cannot be empty', field: 'title' });
    }

    const existingSlugs = await this.postRepo
      .createQueryBuilder('post')
      .select('post.slug')
      .getMany()
      .then((posts) => posts.map((p) => p.slug));

    const slug = generateSlug(data.title, existingSlugs);

    const post = this.postRepo.create({
      title: data.title,
      slug,
      body: data.body,
      status: 'draft',
      tags: data.tags ?? [],
      excerpt: data.excerpt ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
    });

    const saved = await this.postRepo.save(post);
    return ok(this.toPost(saved));
  }

  async update(id: PostId, data: IUpdatePost): Promise<Result<IPost, DomainError>> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      return err({ kind: 'not_found', entity: 'Post', id });
    }

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        return err({ kind: 'validation', message: 'Title cannot be empty', field: 'title' });
      }
      post.title = data.title;
    }
    if (data.body !== undefined) post.body = data.body;
    if (data.tags !== undefined) post.tags = data.tags;
    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.coverImageUrl !== undefined) post.coverImageUrl = data.coverImageUrl;

    const saved = await this.postRepo.save(post);
    return ok(this.toPost(saved));
  }

  async publish(id: PostId): Promise<Result<IPost, DomainError>> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      return err({ kind: 'not_found', entity: 'Post', id });
    }
    if (post.status === 'published') {
      return err({ kind: 'conflict', message: 'Post is already published' });
    }

    post.status = 'published';
    post.publishedAt = new Date();
    const saved = await this.postRepo.save(post);
    return ok(this.toPost(saved));
  }

  async unpublish(id: PostId): Promise<Result<IPost, DomainError>> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      return err({ kind: 'not_found', entity: 'Post', id });
    }
    if (post.status !== 'published') {
      return err({ kind: 'conflict', message: 'Post is not published' });
    }

    post.status = 'draft';
    post.publishedAt = null;
    const saved = await this.postRepo.save(post);
    return ok(this.toPost(saved));
  }

  async softDelete(id: PostId): Promise<Result<IPost, DomainError>> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      return err({ kind: 'not_found', entity: 'Post', id });
    }

    post.status = 'archived';
    const saved = await this.postRepo.save(post);
    return ok(this.toPost(saved));
  }

  async findBySlug(slug: string): Promise<Result<IPost, DomainError>> {
    const post = await this.postRepo.findOne({ where: { slug, status: 'published' } });
    if (!post) {
      return err({ kind: 'not_found', entity: 'Post', id: slug });
    }
    return ok(this.toPost(post));
  }

  async findById(id: PostId): Promise<Result<IPost, DomainError>> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      return err({ kind: 'not_found', entity: 'Post', id });
    }
    return ok(this.toPost(post));
  }

  async listPublished(page: number, limit: number, tag?: string): Promise<IPostListResult> {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .where('post.status = :status', { status: 'published' })
      .orderBy('post.publishedAt', 'DESC', 'NULLS LAST');

    if (tag) {
      qb.andWhere(':tag = ANY(post.tags)', { tag });
    }

    const total = await qb.getCount();
    const posts = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      posts: posts.map((p) => this.toPost(p)),
      total,
      page,
      limit,
    };
  }

  async listAll(page: number, limit: number): Promise<IPostListResult> {
    const [posts, total] = await this.postRepo.findAndCount({
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      posts: posts.map((p) => this.toPost(p)),
      total,
      page,
      limit,
    };
  }

  private toPost(entity: Post): IPost {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      body: entity.body,
      status: entity.status,
      tags: entity.tags,
      excerpt: entity.excerpt,
      coverImageUrl: entity.coverImageUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      publishedAt: entity.publishedAt,
    };
  }
}
