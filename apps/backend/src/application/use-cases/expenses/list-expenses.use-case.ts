import { Inject, Injectable } from '@nestjs/common';
import { Expense } from '../../../domain/entities/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
  ExpenseFilters,
  PaginationOptions,
} from '../../../domain/repositories/expense.repository.interface';

export interface ListExpensesQuery {
  userId: string;
  filters?: ExpenseFilters;
  pagination?: PaginationOptions;
}

export interface ListExpensesResult {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ListExpensesUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: ListExpensesQuery): Promise<ListExpensesResult> {
    const result = await this.expenseRepository.findByUserId(
      query.userId,
      query.pagination?.page,
      query.pagination?.limit,
    );

    return {
      expenses: result.data,
      total: result.total,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 20,
      totalPages: Math.ceil(result.total / (query.pagination?.limit || 20)),
    };
  }
}
