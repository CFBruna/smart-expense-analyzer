import { Expense } from '../entities/expense.entity';

export interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface IExpenseRepository {
  create(expense: Expense): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findByUserId(
    userId: string,
    page?: number,
    limit?: number,
    sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: Expense[]; total: number }>;
  update(expense: Expense): Promise<Expense>;
  delete(id: string): Promise<void>;
  findByUserIdAndDateRange(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    sortOrder?: 'asc' | 'desc',
    page?: number,
    limit?: number,
  ): Promise<{ data: Expense[]; total: number }>;
  getAnalyticsSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalSpent: number;
    categoryBreakdown: {
      category: string;
      total: number;
      count: number;
      percentage: number;
    }[];
  }>;
}

export const EXPENSE_REPOSITORY = Symbol('IExpenseRepository');
