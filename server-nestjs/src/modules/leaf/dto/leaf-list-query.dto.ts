import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LeafListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @ApiPropertyOptional({ enum: ['prose', 'blossom', 'fruit', 'seed'] })
  @IsOptional()
  @IsString()
  @IsIn(['prose', 'blossom', 'fruit', 'seed'])
  leafType?: string;

  @ApiPropertyOptional({ enum: ['spring', 'summer', 'autumn', 'winter'] })
  @IsOptional()
  @IsString()
  @IsIn(['spring', 'summer', 'autumn', 'winter'])
  season?: string;

  @ApiPropertyOptional({ enum: ['seedling', 'sapling', 'mature', 'evergreen'] })
  @IsOptional()
  @IsString()
  @IsIn(['seedling', 'sapling', 'mature', 'evergreen'])
  growth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vine?: string;
}
