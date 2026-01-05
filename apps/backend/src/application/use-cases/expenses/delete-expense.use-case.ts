import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';

export interface DeleteExpenseInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(input: DeleteExpenseInput): Promise<void> {
    const expense = await this.expenseRepository.findById(input.id);

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${input.id} not found`);
    }

    // Verify ownership
    if (expense.userId !== input.userId) {
      throw new NotFoundException(`Expense with ID ${input.id} not found`);
    }

    await this.expenseRepository.delete(input.id);
  }
}
