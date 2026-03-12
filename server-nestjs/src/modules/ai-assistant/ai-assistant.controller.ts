import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CognitoGuard } from '@modules/auth/cognito.guard';
import { AiAssistantService } from './ai-assistant.service';
import { AiReviewDto, AiRewriteDto } from './dto/ai-review.dto';
import { IAiReviewResult, IAiRewriteResult } from './interfaces/ai-assistant.interfaces';

@ApiTags('AI Assistant')
@Controller('ai')
@UseGuards(CognitoGuard)
@ApiBearerAuth()
export class AiAssistantController {
  constructor(private readonly aiService: AiAssistantService) {}

  @Post('review')
  @ApiOperation({ summary: 'Get AI suggestions for content improvement' })
  async review(@Body() dto: AiReviewDto): Promise<IAiReviewResult> {
    const result = await this.aiService.review(dto.content, dto.contentType);
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_GATEWAY);
    }
    return result.value;
  }

  @Post('rewrite')
  @ApiOperation({ summary: 'Get AI rewrite of content or selected text' })
  async rewrite(@Body() dto: AiRewriteDto): Promise<IAiRewriteResult> {
    const result = await this.aiService.rewrite(
      dto.content,
      dto.contentType,
      dto.selectedText,
    );
    if (!result.ok) {
      throw new HttpException(result.error, HttpStatus.BAD_GATEWAY);
    }
    return result.value;
  }
}
