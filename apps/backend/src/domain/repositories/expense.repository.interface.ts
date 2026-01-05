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
  findById(id: string, userId: string): Promise<Expense | null>;
  findByUserId(
    userId: string,
    filters?: ExpenseFilters,
    pagination?: PaginationOptions,
  ): Promise<{ expenses: Expense[]; total: number }>;
  update(id: string, userId: string, expense: Partial<Expense>): Promise<Expense>;
  delete(id: string, userId: string): Promise<boolean>;
  getMonthlyTotal(userId: string, month: number, year: number): Promise<number>;
  getCategoryBreakdown(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ category: string; total: number; count: number }[]>;
}

export const EXPENSE_REPOSITORY = Symbol('IExpenseRepository');
