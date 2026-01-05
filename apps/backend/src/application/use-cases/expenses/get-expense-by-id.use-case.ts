import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Expense } from '../../../domain/entities/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';

export interface GetExpenseByIdQuery {
  id: string;
  userId: string;
}

@Injectable()
export class GetExpenseByIdUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: GetExpenseByIdQuery): Promise<Expense> {
    const expense = await this.expenseRepository.findById(query.id);

    if (!expense || expense.userId !== query.userId) {
      throw new NotFoundException(`Expense with ID ${query.id} not found`);
    }

    return expense;
  }
}
