import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PostId } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostListQueryDto } from './dto/post-list-query.dto';
import { IPost, IPostListResult } from './interfaces/post.interfaces';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // --- Public endpoints ---

  @Get()
  @ApiOperation({ summary: 'List published posts (public)' })
  async listPublished(@Query() query: PostListQueryDto): Promise<IPostListResult> {
    return this.postService.listPublished(query.page, query.limit, query.tag);
  }

  // --- Admin read endpoint (must be before :slug) ---

  @Get('admin/all')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all posts including drafts (admin)' })
  async listAll(@Query() query: PostListQueryDto): Promise<IPostListResult> {
    return this.postService.listAll(query.page, query.limit);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get published post by slug (public)' })
  async getBySlug(@Param('slug') slug: string): Promise<IPost> {
    const result = await this.postService.findBySlug(slug);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  // --- Admin endpoints ---

  @Post()
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post (admin)' })
  async create(@Body() dto: CreatePostDto): Promise<IPost> {
    const result = await this.postService.create(dto);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Patch(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto): Promise<IPost> {
    const result = await this.postService.update(id as PostId, dto);
    if (!result.ok) {
      const status = result.error.kind === 'not_found' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      throw new HttpException(result.error, status);
    }
    return result.value;
  }

  @Patch(':id/publish')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a post (admin)' })
  async publish(@Param('id') id: string): Promise<IPost> {
    const result = await this.postService.publish(id as PostId);
    if (!result.ok) {
      const status = result.error.kind === 'not_found' ? HttpStatus.NOT_FOUND : HttpStatus.CONFLICT;
      throw new HttpException(result.error, status);
    }
    return result.value;
  }

  @Patch(':id/unpublish')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a post (admin)' })
  async unpublish(@Param('id') id: string): Promise<IPost> {
    const result = await this.postService.unpublish(id as PostId);
    if (!result.ok) {
      const status = result.error.kind === 'not_found' ? HttpStatus.NOT_FOUND : HttpStatus.CONFLICT;
      throw new HttpException(result.error, status);
    }
    return result.value;
  }

  @Delete(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a post (admin)' })
  async remove(@Param('id') id: string): Promise<IPost> {
    const result = await this.postService.softDelete(id as PostId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }
}
