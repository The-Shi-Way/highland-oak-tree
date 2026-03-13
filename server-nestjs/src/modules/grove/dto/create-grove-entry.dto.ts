import { IsString, IsOptional, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroveEntryDto {
  @ApiProperty({ example: 'Brain Pickings' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  @MinLength(1)
  url!: string;

  @ApiPropertyOptional({ example: 'A curated collection of cross-disciplinary interestingness.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Old Oak' })
  @IsOptional()
  @IsString()
  treeLabel?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
