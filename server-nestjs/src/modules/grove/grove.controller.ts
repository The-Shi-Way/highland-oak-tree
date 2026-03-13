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

import { GroveEntryId } from '@shared/types';
import { CognitoGuard } from '@modules/auth/cognito.guard';

import { GroveService } from './grove.service';
import { CreateGroveEntryDto } from './dto/create-grove-entry.dto';
import { UpdateGroveEntryDto } from './dto/update-grove-entry.dto';
import { IGroveEntry } from './interfaces/grove.interfaces';

@ApiTags('Grove')
@Controller('grove')
export class GroveController {
  constructor(private readonly groveService: GroveService) {}

  @Get()
  @ApiOperation({ summary: 'List all grove entries (public)' })
  async listAll(): Promise<IGroveEntry[]> {
    return this.groveService.listAll();
  }

  @Post()
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a grove entry (admin)' })
  async create(@Body() dto: CreateGroveEntryDto): Promise<IGroveEntry> {
    const result = await this.groveService.create(dto);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Patch(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a grove entry (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateGroveEntryDto): Promise<IGroveEntry> {
    const result = await this.groveService.update(id as GroveEntryId, dto);
    if (!result.ok) {
      const status = result.error.kind === 'not_found' ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
      throw new HttpException(result.error, status);
    }
    return result.value;
  }

  @Delete(':id')
  @UseGuards(CognitoGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a grove entry (admin)' })
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.groveService.delete(id as GroveEntryId);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.NOT_FOUND);
    }
  }
}
