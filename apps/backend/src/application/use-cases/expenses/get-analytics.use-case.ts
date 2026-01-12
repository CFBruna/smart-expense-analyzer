import { Inject, Injectable } from '@nestjs/common';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';

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
    @Inject(USER_REPOSITORY)
    private readonly userRepository: any,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async execute(query: GetAnalyticsQuery): Promise<AnalyticsResult> {
    const user = await this.userRepository.findById(query.userId);
    const targetCurrency = user?.currency || 'BRL';

    const currencies = await (this.expenseRepository as any).getDistinctCurrencies(query.userId);
    const rates = await this.exchangeRateService.getBatchRates(currencies, targetCurrency);

    const result = await this.expenseRepository.getAnalyticsSummary(
      query.userId,
      rates,
      query.startDate,
      query.endDate,
    );

    return {
      ...result,
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
    };
  }
}
