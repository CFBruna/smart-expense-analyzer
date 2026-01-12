import { Test, TestingModule } from '@nestjs/testing';
import { GetAnalyticsUseCase } from './get-analytics.use-case';
import { EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';

describe('GetAnalyticsUseCase', () => {
  let useCase: GetAnalyticsUseCase;
  let mockExpenseRepository: any;
  let mockUserRepository: any;
  let mockExchangeRateService: any;

  beforeEach(async () => {
    mockExpenseRepository = {
      getCategoryBreakdown: jest.fn(),
      getAnalyticsSummary: jest.fn(),
      getDistinctCurrencies: jest.fn().mockResolvedValue(['BRL', 'USD']),
      expenseModel: {
        aggregate: jest.fn().mockResolvedValue([]),
      },
    };

    mockUserRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'user123', currency: 'BRL' }),
    };

    mockExchangeRateService = {
      getBatchRates: jest.fn().mockResolvedValue({ BRL: 1, USD: 5.5 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnalyticsUseCase,
        { provide: EXPENSE_REPOSITORY, useValue: mockExpenseRepository },
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: ExchangeRateService, useValue: mockExchangeRateService },
      ],
    }).compile();

    useCase = module.get<GetAnalyticsUseCase>(GetAnalyticsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return analytics with percentage calculations', async () => {
      const mockAggregationResult = [
        { category: 'Food', total: 100, count: 5 },
        { category: 'Transportation', total: 50, count: 3 },
      ];

      mockExpenseRepository.getAnalyticsSummary.mockResolvedValue({
        totalSpent: 150,
        categoryBreakdown: [],
      });

      mockExpenseRepository.expenseModel.aggregate.mockResolvedValue(mockAggregationResult);

      const result = await useCase.execute({
        userId: 'user123',
      });

      expect(result.totalSpent).toBe(150);
      expect(result.categoryBreakdown).toHaveLength(2);
      expect(result.categoryBreakdown[0].category).toBe('Food');
      expect(result.categoryBreakdown[0].total).toBe(100);
      expect(result.categoryBreakdown[0].percentage).toBeCloseTo(66.67, 1);
      expect(result.categoryBreakdown[1].category).toBe('Transportation');
      expect(result.categoryBreakdown[1].total).toBe(50);
      expect(result.categoryBreakdown[1].percentage).toBeCloseTo(33.33, 1);
    });

    it('should handle date filters', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      mockExpenseRepository.getAnalyticsSummary.mockResolvedValue({
        totalSpent: 0,
        categoryBreakdown: [],
      });

      mockExpenseRepository.expenseModel.aggregate.mockResolvedValue([]);

      const result = await useCase.execute({
        userId: 'user123',
        startDate,
        endDate,
      });

      expect(result.period).toEqual({ startDate, endDate });
      expect(result.totalSpent).toBe(0);
      expect(result.categoryBreakdown).toEqual([]);
    });

    it('should handle empty breakdown', async () => {
      mockExpenseRepository.getAnalyticsSummary.mockResolvedValue({
        totalSpent: 0,
        categoryBreakdown: [],
      });

      mockExpenseRepository.expenseModel.aggregate.mockResolvedValue([]);

      const result = await useCase.execute({ userId: 'user123' });

      expect(result.totalSpent).toBe(0);
      expect(result.categoryBreakdown).toEqual([]);
    });

    it('should handle zero percentage when totalSpent is 0', async () => {
      mockExpenseRepository.getAnalyticsSummary.mockResolvedValue({
        totalSpent: 0,
        categoryBreakdown: [],
      });

      mockExpenseRepository.expenseModel.aggregate.mockResolvedValue([
        { category: 'Food', total: 0, count: 1 },
      ]);

      const result = await useCase.execute({ userId: 'user123' });

      expect(result.categoryBreakdown).toHaveLength(1);
      expect(result.categoryBreakdown[0].percentage).toBe(0);
    });
  });
});
