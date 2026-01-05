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
    private readonly aiService: LangchainCategorizationService,
  ) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    // Create expense without category first
    let expense = new Expense(
      null,
      command.userId,
      command.description,
      command.amount,
      command.date,
      null, // Category will be added after AI categorization
    );

    // Get AI categorization
    const category = await this.aiService.categorize(command.description, command.amount);

    // Update expense with category
    expense = expense.withCategory(category);

    // Persist
    return this.expenseRepository.create(expense);
  }
}
