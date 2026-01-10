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
  sortOrder?: 'asc' | 'desc';
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
    const hasDateFilters = query.filters?.startDate || query.filters?.endDate;

    if (hasDateFilters) {
      const expenses = await this.expenseRepository.findByUserIdAndDateRange(
        query.userId,
        query.filters?.startDate,
        query.filters?.endDate,
        query.sortOrder,
      );

      const page = query.pagination?.page || 1;
      const limit = query.pagination?.limit || 20;
      const start = (page - 1) * limit;
      const paginatedExpenses = expenses.slice(start, start + limit);

      return {
        expenses: paginatedExpenses,
        total: expenses.length,
        page,
        limit,
        totalPages: Math.ceil(expenses.length / limit),
      };
    }

    const result = await this.expenseRepository.findByUserId(
      query.userId,
      query.pagination?.page,
      query.pagination?.limit,
      query.sortOrder,
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
