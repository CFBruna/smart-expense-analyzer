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
    const result = await this.expenseRepository.getAnalyticsSummary(
      query.userId,
      query.startDate,
      query.endDate,
    );

    return {
      totalSpent: result.totalSpent,
      categoryBreakdown: result.categoryBreakdown,
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
    };
  }
}
