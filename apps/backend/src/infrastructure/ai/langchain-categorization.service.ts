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

export interface UserCategory {
  name: string;
  isDefault: boolean;
}

export interface ExpenseHistoryItem {
  description: string;
  category: string;
  amount: number;
  date: Date;
}

@Injectable()
export class LangchainCategorizationService {
  private readonly logger = new Logger(LangchainCategorizationService.name);
  private readonly model: ChatGoogleGenerativeAI;

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
  }

  async categorize(
    description: string,
    amount: number,
    userCategories: UserCategory[],
    expenseHistory: ExpenseHistoryItem[] = [],
  ): Promise<Category> {
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
      const customCategories = userCategories
        .filter((c) => !c.isDefault)
        .map((c) => c.name);
      const defaultCategories = userCategories
        .filter((c) => c.isDefault)
        .map((c) => c.name);

      // Build history section
      let historySection = '';
      if (expenseHistory.length > 0) {
        const historyItems = expenseHistory
          .slice(0, 15) // Limit to last 15 expenses
          .map((h) => `- "${h.description}" → ${h.category} (${h.amount.toFixed(2)})`)
          .join('\n');
        historySection = `
**RECENT EXPENSE HISTORY (learn from these patterns):**
${historyItems}

Look for similar descriptions, variations, abbreviations, or related merchants in the history above.
For example: "super 6", "mercado s6", "s6" might all refer to the same supermarket.
`;
      }

      const prompt = PromptTemplate.fromTemplate(`
You are an AI financial advisor specializing in expense categorization.

Analyze the following expense and provide categorization:

Expense description: {description}
Amount: {amount}
Currency: BRL

AVAILABLE CATEGORIES:
**USER-CREATED CATEGORIES (PRIORITIZE THESE):**
{customCategories}

**DEFAULT CATEGORIES (use only if user categories don't match):**
{defaultCategories}

{historySection}

IMPORTANT RULES:
1. ALWAYS prefer user-created categories over default ones when possible
2. Look for SIMILAR or RELATED descriptions in the expense history (e.g., "super 6" is similar to "mercado s6", both are supermarkets)
3. Use semantic similarity - variations of the same place/merchant should use the same category
4. Consider abbreviations, typos, and partial names as similar (e.g., "s6" relates to "super 6" and "mercado s6")
5. Choose the most specific and relevant category available
6. If no good match exists, use the closest default category or "Outros"

Respond ONLY with valid JSON (no markdown, no backticks):
{{
  "category": "string (must be one of the available categories listed above)",
  "subcategory": "string or null",
  "tags": ["string"],
  "confidence": number (0-1, higher if using user-created category or matching history pattern),
  "rationale": "brief explanation of why this category was chosen and if it was based on similar expense in history"
}}

Consider context clues and LEARN from user's previous categorizations in the history.
`);

      const formattedPrompt = await prompt.format({
        description,
        amount: amount.toFixed(2),
        customCategories:
          customCategories.length > 0
            ? customCategories.join(', ')
            : 'None (user has not created any custom categories yet)',
        defaultCategories: defaultCategories.join(', '),
        historySection,
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
      // Fallback to "Outros" category with low confidence
      return new Category('Outros', null, [], 0.0, 'AI categorization failed');
    }
  }
}
