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
    const pagination = query.pagination || { page: 1, limit: 20 };

    const result = await this.expenseRepository.findByUserId(
      query.userId,
      query.filters,
      pagination,
    );

    return {
      expenses: result.expenses,
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit),
    };
  }
}
