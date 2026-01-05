import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Category } from '../../domain/value-objects/category.vo';
import { RedisCacheService } from '../cache/redis-cache.service';

interface AICategorizationResponse {
  category: string;
  subcategory: string | null;
  tags: string[];
  confidence: number;
  rationale?: string;
}

@Injectable()
export class LangchainCategorizationService {
  private readonly logger = new Logger(LangchainCategorizationService.name);
  private readonly model: ChatGoogleGenerativeAI;
  private readonly prompt: PromptTemplate;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: RedisCacheService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured, AI categorization will fail');
    }

    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      modelName: 'gemini-2.5-flash',
      temperature: 0.2,
    });

    this.prompt = PromptTemplate.fromTemplate(`
You are an AI financial advisor specializing in expense categorization.

Analyze the following expense and provide categorization:

Expense description: {description}
Amount: {amount}
Currency: BRL

Respond ONLY with valid JSON (no markdown, no backticks):
{{
  "category": "string (Transportation | Food | Health | Housing | Entertainment | Education | Shopping | Bills | Other)",
  "subcategory": "string or null",
  "tags": ["string"],
  "confidence": number (0-1),
  "rationale": "brief explanation"
}}

Consider context clues (e.g., "Uber para dentista" includes health context).
`);
  }

  async categorize(description: string, amount: number): Promise<Category> {
    // Check cache first
    const cacheKey = this.cacheService.getCategoryKey(description);
    const cached = await this.cacheService.get<Category>(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for description: ${description}`);
      return new Category(
        cached.primary,
        cached.secondary,
        cached.tags,
        cached.confidence,
        cached.rationale,
      );
    }

    this.logger.debug(`Cache miss, calling AI for: ${description}`);

    try {
      const formattedPrompt = await this.prompt.format({
        description,
        amount: amount.toFixed(2),
      });

      const response = await this.model.invoke(formattedPrompt);
      const content = response.content.toString().trim();

      // Remove markdown code blocks if present
      const jsonContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed: AICategorizationResponse = JSON.parse(jsonContent);

      const category = new Category(
        parsed.category,
        parsed.subcategory,
        parsed.tags,
        parsed.confidence,
        parsed.rationale,
      );

      // Cache the result
      await this.cacheService.set(cacheKey, category);

      return category;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`AI categorization failed: ${errorMessage}`, errorStack);
      // Fallback to "Other" category with low confidence
      return new Category('Other', null, [], 0.0, 'AI categorization failed');
    }
  }
}
