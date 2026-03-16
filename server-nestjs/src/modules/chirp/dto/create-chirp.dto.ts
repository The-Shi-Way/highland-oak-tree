import { IsString, MinLength, MaxLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChirpDto {
  @ApiProperty({ example: 'Site maintenance tonight', maxLength: 150 })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title!: string;

  @ApiProperty({ example: 'The site will be down for maintenance from 10pm to 2am.', maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  body!: string;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
