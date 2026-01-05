import { Test, TestingModule } from '@nestjs/testing';
import { GetAnalyticsUseCase } from './get-analytics.use-case';
import { EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository.interface';

describe('GetAnalyticsUseCase', () => {
  let useCase: GetAnalyticsUseCase;
  let mockExpenseRepository: any;

  beforeEach(async () => {
    mockExpenseRepository = {
      getCategoryBreakdown: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnalyticsUseCase,
        { provide: EXPENSE_REPOSITORY, useValue: mockExpenseRepository },
      ],
    }).compile();

    useCase = module.get<GetAnalyticsUseCase>(GetAnalyticsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return analytics with percentage calculations', async () => {
      const mockBreakdown = [
        { category: 'Food', total: 100, count: 5 },
        { category: 'Transportation', total: 50, count: 3 },
      ];

      mockExpenseRepository.getCategoryBreakdown.mockResolvedValue(mockBreakdown);

      const result = await useCase.execute({
        userId: 'user123',
      });

      expect(mockExpenseRepository.getCategoryBreakdown).toHaveBeenCalledWith(
        'user123',
        undefined,
        undefined,
      );

      expect(result.totalSpent).toBe(150);
      expect(result.categoryBreakdown).toHaveLength(2);
      expect(result.categoryBreakdown[0]).toEqual({
        category: 'Food',
        total: 100,
        count: 5,
        percentage: (100 / 150) * 100,
      });
      expect(result.categoryBreakdown[1]).toEqual({
        category: 'Transportation',
        total: 50,
        count: 3,
        percentage: (50 / 150) * 100,
      });
    });

    it('should handle date filters', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      mockExpenseRepository.getCategoryBreakdown.mockResolvedValue([]);

      const result = await useCase.execute({
        userId: 'user123',
        startDate,
        endDate,
      });

      expect(mockExpenseRepository.getCategoryBreakdown).toHaveBeenCalledWith(
        'user123',
        startDate,
        endDate,
      );

      expect(result.period).toEqual({ startDate, endDate });
    });

    it('should handle empty breakdown', async () => {
      mockExpenseRepository.getCategoryBreakdown.mockResolvedValue([]);

      const result = await useCase.execute({ userId: 'user123' });

      expect(result.totalSpent).toBe(0);
      expect(result.categoryBreakdown).toEqual([]);
    });

    it('should handle zero percentage when totalSpent is 0', async () => {
      const mockBreakdown = [{ category: 'Food', total: 0, count: 1 }];
      mockExpenseRepository.getCategoryBreakdown.mockResolvedValue(mockBreakdown);

      const result = await useCase.execute({ userId: 'user123' });

      expect(result.categoryBreakdown[0].percentage).toBe(0);
    });
  });
});
