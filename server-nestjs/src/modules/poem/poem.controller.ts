import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PoemId } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';
import { PoemService } from './poem.service';
import { CreatePoemDto } from './dto/create-poem.dto';
import { UpdatePoemDto } from './dto/update-poem.dto';
import { IPoem } from './interfaces/poem.interfaces';

@ApiTags('Poems')
@Controller('poems')
export class PoemController {
  constructor(private readonly poemService: PoemService) {}

  // --- Public endpoints ---

  @Get()
  @ApiOperation({ summary: 'List all published poems (public)' })
  async listPublished(): Promise<IPoem[]> {
    return this.poemService.listPublished();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a published poem by ID (public)' })
  async getById(@Param('id') id: string): Promise<IPoem> {
    const result = await this.poemService.findPublishedById(id as PoemId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  // --- Admin endpoints ---

  @Post()
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new poem (admin)' })
  async create(@Body() dto: CreatePoemDto): Promise<IPoem> {
    const result = await this.poemService.create(dto);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Patch(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a poem (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePoemDto): Promise<IPoem> {
    const result = await this.poemService.update(id as PoemId, dto);
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
  @ApiOperation({ summary: 'Publish a poem (admin)' })
  async publish(@Param('id') id: string): Promise<IPoem> {
    const result = await this.poemService.publish(id as PoemId);
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
  @ApiOperation({ summary: 'Soft delete a poem (admin)' })
  async remove(@Param('id') id: string): Promise<IPoem> {
    const result = await this.poemService.softDelete(id as PoemId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  @Get('admin/all')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all poems including drafts (admin)' })
  async listAll(): Promise<IPoem[]> {
    return this.poemService.listAll();
  }
}
