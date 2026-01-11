import { Inject, Injectable } from '@nestjs/common';
import { Expense } from '../../../domain/entities/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import {
  LangchainCategorizationService,
  ExpenseHistoryItem,
} from '../../../infrastructure/ai/langchain-categorization.service';
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';

export interface CreateExpenseCommand {
  userId: string;
  description: string;
  amount: number;
  date: Date;
  originalAmount?: number;
  originalCurrency?: string;
}

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly categorizationService: LangchainCategorizationService,
    private readonly exchangeRateService: ExchangeRateService,
  ) { }

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const originalAmount = command.originalAmount || command.amount;
    const originalCurrency = command.originalCurrency || user.currency;
    let amount = originalAmount;

    if (originalCurrency !== user.currency) {
      amount = await this.exchangeRateService.convertAmount(
        command.originalAmount || command.amount,
        command.originalCurrency || 'BRL',
        user.currency, // Convert to user's preferred currency
        command.date // Use the expense date for historical rates
      );
    }

    const expense = new Expense(
      null,
      command.userId,
      command.description,
      amount,
      command.date,
      null,
      originalAmount,
      originalCurrency,
      new Date(),
      new Date(),
    );

    const savedExpense = await this.expenseRepository.create(expense);

    this.processCategorizationAsync(
      savedExpense.id!,
      command.userId,
      command.description,
      command.amount,
    ).catch((error) => {
      console.error('Background categorization failed:', error);
    });

    return savedExpense;
  }

  private async processCategorizationAsync(
    expenseId: string,
    userId: string,
    description: string,
    amount: number,
  ): Promise<void> {
    setImmediate(async () => {
      try {
        const [defaultCategories, userSpecificCategories] = await Promise.all([
          this.categoryRepository.findDefaults(),
          this.categoryRepository.findByUserId(userId),
        ]);

        const allUserCategories = [...defaultCategories, ...userSpecificCategories];

        const recentExpenses = await this.expenseRepository.findByUserId(userId, 1, 15);

        const expenseHistory: ExpenseHistoryItem[] = recentExpenses.data
          .filter((e: Expense) => e.category)
          .map((e: Expense) => ({
            description: e.description,
            category: e.category!.primary,
            amount: e.amount,
            date: e.date,
          }));

        const categoriesForAI = allUserCategories.map((cat) => ({
          name: cat.name,
          isDefault: cat.isDefault,
        }));

        const category = await this.categorizationService.categorize(
          userId,
          description,
          amount,
          categoriesForAI,
          expenseHistory,
        );

        const expense = await this.expenseRepository.findById(expenseId);
        if (expense) {
          expense.category = category;
          await this.expenseRepository.update(expense);
        }
      } catch (error) {
        console.error(`Failed to categorize expense ${expenseId}:`, error);
      }
    });
  }
}
