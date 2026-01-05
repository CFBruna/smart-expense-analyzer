import { Inject, Injectable } from '@nestjs/common';
import { Expense } from '../../../domain/entities/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';
import { LangchainCategorizationService } from '../../../infrastructure/ai/langchain-categorization.service';

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
    private readonly categorizationService: LangchainCategorizationService,
  ) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    // Create expense WITHOUT category first (instant save)
    const expense = new Expense(
      null,
      command.userId,
      command.description,
      command.amount,
      command.date,
      null, // No category yet
      new Date(),
      new Date(),
    );

    // Save to database immediately
    const savedExpense = await this.expenseRepository.create(expense);

    // Process AI categorization in background (non-blocking)
    this.processCategorizationAsync(savedExpense.id!, command.description, command.amount).catch(
      (error) => {
        // Log error but don't fail the request
        console.error('Background categorization failed:', error);
      },
    );

    return savedExpense;
  }

  private async processCategorizationAsync(
    expenseId: string,
    description: string,
    amount: number,
  ): Promise<void> {
    // Run categorization in background
    setImmediate(async () => {
      try {
        const category = await this.categorizationService.categorize(description, amount);

        // Update expense with category
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
