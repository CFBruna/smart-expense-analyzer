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
import { LangchainCategorizationService, ExpenseHistoryItem } from '../../../infrastructure/ai/langchain-categorization.service';

export interface CreateExpenseCommand {
  userId: string;
  description: string;
  amount: number;
  date: Date;
}

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly categorizationService: LangchainCategorizationService,
  ) { }

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    const expense = new Expense(
      null,
      command.userId,
      command.description,
      command.amount,
      command.date,
      null,
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
        const userCategories = await this.categoryRepository.findByUserId(userId);
        const recentExpenses = await this.expenseRepository.findByUserId(userId, 1, 15);

        const expenseHistory: ExpenseHistoryItem[] = recentExpenses.data
          .filter((e: Expense) => e.category)
          .map((e: Expense) => ({
            description: e.description,
            category: e.category!.primary,
            amount: e.amount,
            date: e.date,
          }));

        const categoriesForAI = userCategories.map((cat) => ({
          name: cat.name,
          isDefault: cat.isDefault,
        }));

        const category = await this.categorizationService.categorize(
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
