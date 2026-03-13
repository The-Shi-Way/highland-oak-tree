import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

import { Result, ok, err, DomainError } from '@shared/types';
import {
  IAiReviewResult,
  IAiRewriteResult,
  IAiSuggestion,
} from './interfaces/ai-assistant.interfaces';

const SYSTEM_PROMPT = `You are a writing assistant for "The Highland Oak Tree" blog, written by an AI engineer and consultant. 
Maintain the author's personal voice — technical yet approachable, with a blend of engineering precision and business insight.
For poems, respect the creative intent and artistic expression.
When reviewing, provide specific, actionable suggestions. Return your response as valid JSON.`;

const REVIEW_PROMPT = (contentType: string, content: string): string =>
  `Review the following ${contentType} for clarity, tone, grammar, and structure. 
Return a JSON array of suggestions, each with "original" (the text to change), "suggested" (the improved text), and "reason" (why this change improves the writing).
Only suggest changes that meaningfully improve the content. Return an empty array if no changes are needed.

Content:
${content}

Respond with ONLY valid JSON: { "suggestions": [...] }`;

const REWRITE_PROMPT = (contentType: string, content: string, selectedText?: string): string =>
  `Rewrite the following ${selectedText ? 'selected portion of a' : ''} ${contentType} to improve clarity and flow while preserving the original meaning and the author's voice.
${selectedText ? `\nSelected text to rewrite:\n${selectedText}\n\nFull context:\n` : ''}${content}

Respond with ONLY valid JSON: { "rewritten": "..." }`;

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly bedrockClient: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(private readonly config: ConfigService) {
    this.bedrockClient = new BedrockRuntimeClient({
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
    });
    this.modelId = this.config.get<string>(
      'BEDROCK_MODEL_ID',
      'anthropic.claude-sonnet-4-6-20250514',
    );
  }

  async review(
    content: string,
    contentType: 'post' | 'poem',
  ): Promise<Result<IAiReviewResult, DomainError>> {
    if (this.isDevMode()) {
      return ok(this.mockReview(content, contentType));
    }

    const prompt = REVIEW_PROMPT(contentType, content);

    const response = await this.invokeModel(prompt);
    if (!response.ok) return response;

    try {
      const parsed = JSON.parse(response.value) as { suggestions?: unknown[] };
      const suggestions: IAiSuggestion[] = Array.isArray(parsed.suggestions)
        ? (parsed.suggestions as IAiSuggestion[]).filter(
            (s) =>
              typeof s.original === 'string' &&
              typeof s.suggested === 'string' &&
              typeof s.reason === 'string',
          )
        : [];

      return ok({ suggestions });
    } catch {
      this.logger.warn('Failed to parse AI review response');
      return ok({ suggestions: [] });
    }
  }

  async rewrite(
    content: string,
    contentType: 'post' | 'poem',
    selectedText?: string,
  ): Promise<Result<IAiRewriteResult, DomainError>> {
    if (this.isDevMode()) {
      return ok(this.mockRewrite(selectedText ?? content));
    }

    const prompt = REWRITE_PROMPT(contentType, content, selectedText);

    const response = await this.invokeModel(prompt);
    if (!response.ok) return response;

    try {
      const parsed = JSON.parse(response.value) as { rewritten?: string };
      if (typeof parsed.rewritten !== 'string') {
        return err({
          kind: 'external_service',
          service: 'Bedrock',
          message: 'AI returned an unexpected response format',
        });
      }
      return ok({ rewritten: parsed.rewritten });
    } catch {
      this.logger.warn('Failed to parse AI rewrite response');
      return err({
        kind: 'external_service',
        service: 'Bedrock',
        message: 'Failed to parse AI response',
      });
    }
  }

  private async invokeModel(prompt: string): Promise<Result<string, DomainError>> {
    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      const response = await this.bedrockClient.send(command, {
        abortSignal: controller.signal,
      });

      clearTimeout(timeout);

      const responseBody = JSON.parse(
        new TextDecoder().decode(response.body),
      ) as { content?: Array<{ text?: string }> };

      const text = responseBody.content?.[0]?.text;
      if (!text) {
        return err({
          kind: 'external_service',
          service: 'Bedrock',
          message: 'AI returned an empty response',
        });
      }

      return ok(text);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return err({
          kind: 'external_service',
          service: 'Bedrock',
          message: 'AI request timed out after 30 seconds',
        });
      }

      this.logger.error('Bedrock invocation failed', error);
      return err({
        kind: 'external_service',
        service: 'Bedrock',
        message: 'AI service is temporarily unavailable',
      });
    }
  }

  private isDevMode(): boolean {
    return this.config.get<string>('NODE_ENV') === 'development';
  }

  private mockReview(content: string, contentType: 'post' | 'poem'): IAiReviewResult {
    this.logger.log('[DEV] Returning mock AI review suggestions');
    const words = content.split(/\s+/).filter(Boolean);
    const suggestions: IAiSuggestion[] = [];

    if (words.length > 5) {
      const snippet = words.slice(0, 4).join(' ');
      suggestions.push({
        original: snippet,
        suggested: `${snippet} — refined`,
        reason: contentType === 'poem'
          ? 'Consider adding a more evocative opening to draw the reader in.'
          : 'The opening could be more engaging to hook the reader immediately.',
      });
    }

    if (words.length > 15) {
      const mid = Math.floor(words.length / 2);
      const midSnippet = words.slice(mid, mid + 3).join(' ');
      suggestions.push({
        original: midSnippet,
        suggested: `${midSnippet} (clarified)`,
        reason: 'This passage could be clearer — consider simplifying the phrasing.',
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        original: content.slice(0, 30) || 'your content',
        suggested: (content.slice(0, 30) || 'your content') + ', enhanced',
        reason: '[Dev mock] This is a sample suggestion. In production, Claude will provide real feedback.',
      });
    }

    return { suggestions };
  }

  private mockRewrite(text: string): IAiRewriteResult {
    this.logger.log('[DEV] Returning mock AI rewrite');
    return {
      rewritten: `[Rewritten] ${text.trim()}\n\n(This is a dev-mode mock rewrite. In production, Claude will provide a genuine rewrite.)`,
    };
  }
}
