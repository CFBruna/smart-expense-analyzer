import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import { Expense } from '../../../domain/entities/expense.entity';
import { Category } from '../../../domain/value-objects/category.vo';
import { LangchainCategorizationService } from '../../../infrastructure/ai/langchain-categorization.service';
import { RedisCacheService } from '../../../infrastructure/cache/redis-cache.service';

export interface UpdateExpenseInput {
  id: string;
  userId: string;
  description?: string;
  amount?: number;
  date?: Date;
  manualCategory?: {
    primary: string;
    secondary?: string | null;
  };
}

@Injectable()
export class UpdateExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly categorizationService: LangchainCategorizationService,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(input: UpdateExpenseInput): Promise<Expense> {
    const existingExpense = await this.expenseRepository.findById(input.id);

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${input.id} not found`);
    }

    if (existingExpense.userId !== input.userId) {
      throw new NotFoundException(`Expense with ID ${input.id} not found`);
    }

    const updatedDescription = input.description ?? existingExpense.description;
    const updatedAmount = input.amount ?? existingExpense.amount;
    const updatedDate = input.date ?? existingExpense.date;

    let category = existingExpense.category;

    if (input.manualCategory) {
      category = new Category(
        input.manualCategory.primary,
        input.manualCategory.secondary ?? null,
        [],
        1.0,
        'Manually set by user',
      );

      const cacheKey = this.cacheService.getCategoryKey(updatedDescription);
      await this.cacheService.set(cacheKey, category);
    } else if (input.description || input.amount) {
      const userCategories = await this.categoryRepository.findByUserId(input.userId);
      const categoriesForAI = userCategories.map((cat) => ({
        name: cat.name,
        isDefault: cat.isDefault,
      }));

      category = await this.categorizationService.categorize(
        updatedDescription,
        updatedAmount,
        categoriesForAI,
      );
    }

    const updatedExpense = new Expense(
      existingExpense.id!,
      existingExpense.userId,
      updatedDescription,
      updatedAmount,
      updatedDate,
      category,
      existingExpense.createdAt,
      new Date(),
    );

    return this.expenseRepository.update(updatedExpense);
  }
}
