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
    it('should return analytics from repository with period', async () => {
      const mockResult = {
        totalSpent: 150,
        categoryBreakdown: [
          { category: 'Food', total: 100, count: 5, percentage: 66.67 },
          { category: 'Transportation', total: 50, count: 3, percentage: 33.33 },
        ],
      };

      mockExpenseRepository.getAnalyticsSummary.mockResolvedValue(mockResult);

      const result = await useCase.execute({
        userId: 'user123',
      });

      expect(mockExpenseRepository.getAnalyticsSummary).toHaveBeenCalledWith(
        'user123',
        expect.any(Object), // rates
        undefined,
        undefined,
      );
      expect(result.totalSpent).toBe(150);
      expect(result.categoryBreakdown).toEqual(mockResult.categoryBreakdown);
      expect(result.period).toBeDefined();
    });

    it('should handle date filters', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const mockResult = {
        totalSpent: 0,
        categoryBreakdown: [],
      };

      mockExpenseRepository.getAnalyticsSummary.mockResolvedValue(mockResult);

      const result = await useCase.execute({
        userId: 'user123',
        startDate,
        endDate,
      });

      expect(mockExpenseRepository.getAnalyticsSummary).toHaveBeenCalledWith(
        'user123',
        expect.any(Object),
        startDate,
        endDate,
      );
      expect(result.period).toEqual({ startDate, endDate });
      expect(result.totalSpent).toBe(0);
    });
  });
});
