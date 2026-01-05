import { Inject, Injectable } from '@nestjs/common';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';

export interface GetAnalyticsQuery {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface AnalyticsResult {
  totalSpent: number;
  categoryBreakdown: CategoryBreakdown[];
  period: {
    startDate?: Date;
    endDate?: Date;
  };
}

@Injectable()
export class GetAnalyticsUseCase {
  constructor(
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
  ) {}

  async execute(query: GetAnalyticsQuery): Promise<AnalyticsResult> {
    const breakdown = await this.expenseRepository.getCategoryBreakdown(
      query.userId,
      query.startDate,
      query.endDate,
    );

    const totalSpent = breakdown.reduce(
      (sum: number, item: { total: number }) => sum + item.total,
      0,
    );

    const categoryBreakdown = breakdown.map(
      (item: { category: string; total: number; count: number }) => ({
        ...item,
        percentage: totalSpent > 0 ? (item.total / totalSpent) * 100 : 0,
      }),
    );

    return {
      totalSpent,
      categoryBreakdown,
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
    };
  }
}
