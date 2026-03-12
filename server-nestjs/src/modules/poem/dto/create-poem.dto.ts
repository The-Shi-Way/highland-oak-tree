import { IsString, IsOptional, IsObject, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePoemDto {
  @ApiProperty({ example: 'Ode to Silicon' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: { type: 'doc', content: [] } })
  @IsObject()
  body!: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'classic', default: 'classic' })
  @IsOptional()
  @IsString()
  theme?: string;
}
