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
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';

export interface UpdateExpenseInput {
  id: string;
  userId: string;
  description?: string;
  amount?: number;
  date?: Date;
  originalAmount?: number;
  originalCurrency?: string;
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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly categorizationService: LangchainCategorizationService,
    private readonly cacheService: RedisCacheService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async execute(input: UpdateExpenseInput): Promise<Expense> {
    const existingExpense = await this.expenseRepository.findById(input.id);

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${input.id} not found`);
    }

    if (existingExpense.userId !== input.userId) {
      throw new NotFoundException(`Expense with ID ${input.id} not found`);
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${input.userId} not found`);
    }

    const updatedDescription = input.description ?? existingExpense.description;
    const updatedDate = input.date ?? existingExpense.date;
    const updatedOriginalAmount =
      input.originalAmount ??
      existingExpense.originalAmount ??
      input.amount ??
      existingExpense.amount;
    const updatedOriginalCurrency =
      input.originalCurrency ?? existingExpense.originalCurrency ?? user.currency;

    let updatedAmount = updatedOriginalAmount;

    if (updatedOriginalCurrency !== user.currency) {
      updatedAmount = await this.exchangeRateService.convertAmount(
        updatedOriginalAmount,
        updatedOriginalCurrency,
        user.currency,
        updatedDate,
      );
    } else {
      updatedAmount = updatedOriginalAmount;
    }

    let category = existingExpense.category;

    if (input.manualCategory) {
      category = new Category(
        input.manualCategory.primary,
        input.manualCategory.secondary ?? null,
        [],
        1.0,
        'Manually set by user',
      );

      await this.cacheService.setCategoryCache(input.userId, updatedDescription, category);
    } else if (input.description || input.amount || input.originalAmount) {
      // If amount changed, categorization might change? Usually amount doesn't affect category much, but description does.
      const [defaultCategories, userSpecificCategories] = await Promise.all([
        this.categoryRepository.findDefaults(),
        this.categoryRepository.findByUserId(input.userId),
      ]);

      const allUserCategories = [...defaultCategories, ...userSpecificCategories];

      const categoriesForAI = allUserCategories.map((cat) => ({
        name: cat.name,
        isDefault: cat.isDefault,
      }));

      category = await this.categorizationService.categorize(
        input.userId,
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
      updatedOriginalAmount,
      updatedOriginalCurrency,
      existingExpense.createdAt,
      new Date(),
    );

    return this.expenseRepository.update(updatedExpense);
  }
}
