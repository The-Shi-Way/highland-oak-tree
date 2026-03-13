import { IsString, IsIn, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiReviewDto {
  @ApiProperty({ example: 'Your draft content here...' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiProperty({ enum: ['prose', 'blossom', 'fruit', 'seed'] })
  @IsIn(['prose', 'blossom', 'fruit', 'seed'])
  leafType!: 'prose' | 'blossom' | 'fruit' | 'seed';
}

export class AiRewriteDto {
  @ApiProperty({ example: 'Text to rewrite...' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiProperty({ enum: ['prose', 'blossom', 'fruit', 'seed'] })
  @IsIn(['prose', 'blossom', 'fruit', 'seed'])
  leafType!: 'prose' | 'blossom' | 'fruit' | 'seed';

  @ApiPropertyOptional({ example: 'Selected portion to rewrite' })
  @IsOptional()
  @IsString()
  selectedText?: string;
}
