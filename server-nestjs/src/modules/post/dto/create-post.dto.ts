import { IsString, IsOptional, IsObject, IsArray, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Blog Post' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: { type: 'doc', content: [] } })
  @IsObject()
  body!: Record<string, unknown>;

  @ApiPropertyOptional({ example: ['ai', 'engineering'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImageUrl?: string;
}
