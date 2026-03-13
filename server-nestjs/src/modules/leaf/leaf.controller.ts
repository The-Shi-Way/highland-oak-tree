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

import { LeafId, LeafType, Season, GrowthStage } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';

import { LeafService } from './leaf.service';
import { MigrationService, IMigrationResult } from './migration.service';
import { CreateLeafDto } from './dto/create-leaf.dto';
import { UpdateLeafDto } from './dto/update-leaf.dto';
import { LeafListQueryDto } from './dto/leaf-list-query.dto';
import { ILeaf, ILeafListResult } from './interfaces/leaf.interfaces';

@ApiTags('Leaves')
@Controller('leaves')
export class LeafController {
  constructor(
    private readonly leafService: LeafService,
    private readonly migrationService: MigrationService,
  ) {}

  // --- Public endpoints ---

  @Get('branch/:leafType')
  @ApiOperation({ summary: 'List published leaves by branch (public)' })
  async listByBranch(
    @Param('leafType') leafType: string,
    @Query() query: LeafListQueryDto,
  ): Promise<ILeafListResult> {
    return this.leafService.listByBranch(
      leafType as LeafType,
      query.page,
      query.limit,
      query.season as Season | undefined,
      query.growth as GrowthStage | undefined,
      query.vine,
    );
  }

  @Get('vine/:vineName')
  @ApiOperation({ summary: 'List leaves by vine tag (public)' })
  async listByVine(
    @Param('vineName') vineName: string,
    @Query() query: LeafListQueryDto,
  ): Promise<ILeafListResult> {
    return this.leafService.listByVine(vineName, query.page, query.limit);
  }

  @Get('forest-floor')
  @ApiOperation({ summary: 'List forest floor archive (public)' })
  async listForestFloor(@Query() query: LeafListQueryDto): Promise<ILeafListResult> {
    return this.leafService.listForestFloor(query.page, query.limit);
  }

  @Get('canopy')
  @ApiOperation({ summary: 'List all published leaves with filters (public)' })
  async listCanopy(@Query() query: LeafListQueryDto): Promise<ILeafListResult> {
    return this.leafService.listCanopy(
      query.page,
      query.limit,
      query.leafType as LeafType | undefined,
      query.season as Season | undefined,
      query.growth as GrowthStage | undefined,
      query.vine,
    );
  }

  @Get('trunk')
  @ApiOperation({ summary: 'Homepage feed with seed sidebar (public)' })
  async listTrunk(
    @Query() query: LeafListQueryDto,
  ): Promise<{ feed: ILeafListResult; seeds: ILeaf[] }> {
    return this.leafService.listForTrunk(query.page, query.limit);
  }

  @Get('related/:id')
  @ApiOperation({ summary: 'Related leaves sharing vines (public)' })
  async findRelated(@Param('id') id: string): Promise<ILeaf[]> {
    return this.leafService.findRelatedByVines(id as LeafId);
  }

  // --- Admin read endpoints (must be before :leafType/:slug) ---

  @Get('admin/all')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all leaves including drafts (admin)' })
  async listAll(@Query() query: LeafListQueryDto): Promise<ILeafListResult> {
    return this.leafService.listAll(query.page, query.limit);
  }

  @Get('admin/:id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get any leaf by ID (admin)' })
  async getById(@Param('id') id: string): Promise<ILeaf> {
    const result = await this.leafService.findById(id as LeafId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  @Post('admin/migrate')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Migrate posts and poems to leaves (admin)' })
  async migrate(): Promise<IMigrationResult> {
    const result = await this.migrationService.migrate();
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.value;
  }

  // --- Public single leaf by type + slug ---

  @Get(':leafType/:slug')
  @ApiOperation({ summary: 'Get published leaf by type and slug (public)' })
  async getBySlug(
    @Param('leafType') _leafType: string,
    @Param('slug') slug: string,
  ): Promise<ILeaf> {
    const result = await this.leafService.findBySlug(slug);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  // --- Admin write endpoints ---

  @Post()
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new leaf (admin)' })
  async create(@Body() dto: CreateLeafDto): Promise<ILeaf> {
    const result = await this.leafService.create({
      title: dto.title,
      body: dto.body,
      leafType: dto.leafType as LeafType,
      growth: dto.growth as GrowthStage | undefined,
      vines: dto.vines,
      excerpt: dto.excerpt,
      featuredImage: dto.featuredImage,
    });
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Patch(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a leaf (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateLeafDto): Promise<ILeaf> {
    const result = await this.leafService.update(id as LeafId, {
      title: dto.title,
      body: dto.body,
      leafType: dto.leafType as LeafType | undefined,
      growth: dto.growth as GrowthStage | undefined,
      vines: dto.vines,
      excerpt: dto.excerpt,
      featuredImage: dto.featuredImage,
    });
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
  @ApiOperation({ summary: 'Publish a leaf (admin)' })
  async publish(@Param('id') id: string): Promise<ILeaf> {
    const result = await this.leafService.publish(id as LeafId);
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
  @ApiOperation({ summary: 'Unpublish a leaf (admin)' })
  async unpublish(@Param('id') id: string): Promise<ILeaf> {
    const result = await this.leafService.unpublish(id as LeafId);
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
  @ApiOperation({ summary: 'Soft delete a leaf (admin)' })
  async remove(@Param('id') id: string): Promise<ILeaf> {
    const result = await this.leafService.softDelete(id as LeafId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
    return result.value;
  }
}
