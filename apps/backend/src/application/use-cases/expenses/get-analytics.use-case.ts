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

    const convertedBreakdown = await this.convertCategoryBreakdown(
      query.userId,
      targetCurrency,
      rates,
      query.startDate,
      query.endDate,
    );

    const totalConverted = convertedBreakdown.reduce((sum, item) => sum + item.total, 0);
    const breakdown = convertedBreakdown.map((item) => ({
      ...item,
      percentage: totalConverted > 0 ? (item.total / totalConverted) * 100 : 0,
    }));

    return {
      totalSpent: totalConverted,
      categoryBreakdown: breakdown,
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
    };
  }

  private async convertCategoryBreakdown(
    userId: string,
    targetCurrency: string,
    rates: Record<string, number>,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ category: string; total: number; count: number }[]> {
    const repo = this.expenseRepository as any;
    const match: any = { userId };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = startDate;
      if (endDate) match.date.$lte = endDate;
    }

    const aggregation = await repo.expenseModel.aggregate([
      { $match: match },
      {
        $addFields: {
          convertedAmount: {
            $multiply: [
              '$originalAmount',
              {
                $switch: {
                  branches: Object.keys(rates).map((curr) => ({
                    case: { $eq: ['$originalCurrency', curr] },
                    then: rates[curr],
                  })),
                  default: 1,
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$category.primary',
          total: { $sum: '$convertedAmount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return aggregation;
  }
}
