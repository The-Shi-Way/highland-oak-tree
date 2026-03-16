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

import { ChirpId } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';

import { ChirpService } from './chirp.service';
import { CreateChirpDto } from './dto/create-chirp.dto';
import { UpdateChirpDto } from './dto/update-chirp.dto';
import { ChirpListQueryDto } from './dto/chirp-list-query.dto';
import { IChirp, IChirpListResult } from './interfaces/chirp.interfaces';

@ApiTags('Chirps')
@Controller('chirps')
export class ChirpController {
  constructor(private readonly chirpService: ChirpService) {}

  // --- Public endpoint ---

  @Get()
  @ApiOperation({ summary: 'List active chirps (bulletin board)' })
  async listActive(@Query() query: ChirpListQueryDto): Promise<IChirpListResult> {
    return this.chirpService.listActive(query.page, query.limit);
  }

  // --- Admin read endpoints ---

  @Get('admin/all')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all chirps including drafts (admin)' })
  async listAll(@Query() query: ChirpListQueryDto): Promise<IChirpListResult> {
    return this.chirpService.listAll(query.page, query.limit);
  }

  @Get('admin/:id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chirp by ID (admin)' })
  async getById(@Param('id') id: string): Promise<IChirp> {
    const result = await this.chirpService.findById(id as ChirpId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  // --- Admin write endpoints ---

  @Post()
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a chirp (admin)' })
  async create(@Body() dto: CreateChirpDto): Promise<IChirp> {
    const data = {
      title: dto.title,
      body: dto.body,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    };
    const result = await this.chirpService.create(data);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Patch(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a chirp (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateChirpDto): Promise<IChirp> {
    const data = {
      title: dto.title,
      body: dto.body,
      expiresAt: dto.expiresAt === null ? null : dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    };
    const result = await this.chirpService.update(id as ChirpId, data);
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
  @ApiOperation({ summary: 'Publish a chirp (admin)' })
  async publish(@Param('id') id: string): Promise<IChirp> {
    const result = await this.chirpService.publish(id as ChirpId);
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
  @ApiOperation({ summary: 'Unpublish a chirp (admin)' })
  async unpublish(@Param('id') id: string): Promise<IChirp> {
    const result = await this.chirpService.unpublish(id as ChirpId);
    if (!result.ok) {
      const status = result.error.kind === 'not_found' ? HttpStatus.NOT_FOUND : HttpStatus.CONFLICT;
      throw new HttpException(result.error, status);
    }
    return result.value;
  }

  @Patch(':id/pin')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pin a chirp (admin)' })
  async pin(@Param('id') id: string): Promise<IChirp> {
    const result = await this.chirpService.pin(id as ChirpId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  @Patch(':id/unpin')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpin a chirp (admin)' })
  async unpin(@Param('id') id: string): Promise<IChirp> {
    const result = await this.chirpService.unpin(id as ChirpId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  @Delete(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a chirp (admin)' })
  async remove(@Param('id') id: string): Promise<IChirp> {
    const result = await this.chirpService.softDelete(id as ChirpId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }
}
