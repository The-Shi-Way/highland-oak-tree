import { IsString, IsOptional, IsObject, IsArray, IsIn, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeafDto {
  @ApiProperty({ example: 'Morning Light Through Branches' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: { type: 'doc', content: [] } })
  @IsObject()
  body!: Record<string, unknown>;

  @ApiProperty({ enum: ['prose', 'blossom', 'fruit', 'seed'] })
  @IsString()
  @IsIn(['prose', 'blossom', 'fruit', 'seed'])
  leafType!: string;

  @ApiPropertyOptional({ enum: ['seedling', 'sapling', 'mature', 'evergreen'], default: 'seedling' })
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
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  featuredImage?: string;
}
