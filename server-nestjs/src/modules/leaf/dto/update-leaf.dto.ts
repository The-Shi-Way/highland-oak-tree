import { IsString, IsOptional, IsObject, IsArray, IsIn, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeafDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  body?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ['prose', 'blossom', 'fruit', 'seed'] })
  @IsOptional()
  @IsString()
  @IsIn(['prose', 'blossom', 'fruit', 'seed'])
  leafType?: string;

  @ApiPropertyOptional({ enum: ['seedling', 'sapling', 'mature', 'evergreen'] })
  @IsOptional()
  @IsString()
  @IsIn(['seedling', 'sapling', 'mature', 'evergreen'])
  growth?: string;

  @ApiPropertyOptional({ example: ['nature', 'reflection'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vines?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  featuredImage?: string | null;
}
