import { Inject, Injectable } from '@nestjs/common';
import { Expense } from '../../../domain/entities/expense.entity';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
  ExpenseFilters,
  PaginationOptions,
} from '../../../domain/repositories/expense.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';

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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: any,
    private readonly exchangeRateService: ExchangeRateService,
  ) { }

  async execute(query: ListExpensesQuery): Promise<ListExpensesResult> {
    const user = await this.userRepository.findById(query.userId);
    const targetCurrency = user?.currency || 'BRL';
    const hasDateFilters = query.filters?.startDate || query.filters?.endDate;

    let result: { data: Expense[]; total: number };

    if (hasDateFilters) {
      result = await this.expenseRepository.findByUserIdAndDateRange(
        query.userId,
        query.filters?.startDate,
        query.filters?.endDate,
        query.sortOrder,
        query.pagination?.page,
        query.pagination?.limit,
      );
    } else {
      result = await this.expenseRepository.findByUserId(
        query.userId,
        query.pagination?.page,
        query.pagination?.limit,
        query.sortOrder,
      );
    }

    const uniqueCurrencies = [...new Set(result.data.map((e) => e.originalCurrency))];
    const rates = await this.exchangeRateService.getBatchRates(uniqueCurrencies, targetCurrency);

    const convertedExpenses = result.data.map((expense) => {
      if (expense.originalCurrency === targetCurrency) {
        if (expense.amount !== expense.originalAmount) {
          return new Expense(
            expense.id,
            expense.userId,
            expense.description,
            expense.originalAmount,
            expense.date,
            expense.category,
            expense.originalAmount,
            expense.originalCurrency,
            expense.createdAt,
            expense.updatedAt,
          );
        }
        return expense;
      }
      const rate = rates[expense.originalCurrency];

      if (!rate) {
        return expense;
      }

      const convertedAmount = Number((expense.originalAmount * rate).toFixed(2));
      return new Expense(
        expense.id,
        expense.userId,
        expense.description,
        convertedAmount,
        expense.date,
        expense.category,
        expense.originalAmount,
        expense.originalCurrency,
        expense.createdAt,
        expense.updatedAt,
      );
    });

    return {
      expenses: convertedExpenses,
      total: result.total,
      page: query.pagination?.page || 1,
      limit: query.pagination?.limit || 20,
      totalPages: Math.ceil(result.total / (query.pagination?.limit || 20)),
    };
  }
}
