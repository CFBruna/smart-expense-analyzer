import { Test, TestingModule } from '@nestjs/testing';
import { ListExpensesUseCase } from './list-expenses.use-case';
import { EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { ExchangeRateService } from '../../../infrastructure/services/exchange-rate.service';
import { Expense } from '../../../domain/entities/expense.entity';

describe('ListExpensesUseCase', () => {
  let useCase: ListExpensesUseCase;
  let mockExpenseRepository: any;
  let mockUserRepository: any;
  let mockExchangeRateService: any;

  beforeEach(async () => {
    mockExpenseRepository = {
      findByUserId: jest.fn(),
      findByUserIdAndDateRange: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'user123', currency: 'BRL' }),
    };

    mockExchangeRateService = {
      getBatchRates: jest.fn().mockResolvedValue({ BRL: 1, USD: 5.5 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListExpensesUseCase,
        { provide: EXPENSE_REPOSITORY, useValue: mockExpenseRepository },
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: ExchangeRateService, useValue: mockExchangeRateService },
      ],
    }).compile();

    useCase = module.get<ListExpensesUseCase>(ListExpensesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockExpenses = [
      new Expense('1', 'user123', 'Test1', 10, new Date(), null),
      new Expense('2', 'user123', 'Test2', 20, new Date(), null),
    ];

    it('should list expenses with default pagination', async () => {
      mockExpenseRepository.findByUserId.mockResolvedValue({
        data: mockExpenses,
        total: 2,
      });

      const result = await useCase.execute({ userId: 'user123' });

      expect(mockExpenseRepository.findByUserId).toHaveBeenCalledWith(
        'user123',
        undefined,
        undefined,
        undefined,
      );

      expect(result).toEqual({
        expenses: mockExpenses,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should list expenses with custom pagination', async () => {
      mockExpenseRepository.findByUserId.mockResolvedValue({
        data: mockExpenses,
        total: 100,
      });

      const result = await useCase.execute({
        userId: 'user123',
        pagination: { page: 2, limit: 10 },
      });

      expect(mockExpenseRepository.findByUserId).toHaveBeenCalledWith('user123', 2, 10, undefined);

      expect(result).toEqual({
        expenses: mockExpenses,
        total: 100,
        page: 2,
        limit: 10,
        totalPages: 10,
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockExpenseRepository.findByUserId.mockResolvedValue({
        data: [],
        total: 25,
      });

      const result = await useCase.execute({
        userId: 'user123',
        pagination: { page: 1, limit: 10 },
      });

      expect(result.totalPages).toBe(3);
    });
    it('should return original expense if exchange rate is missing', async () => {
      const expense = new Expense(
        '1',
        'user1',
        'Lunch',
        50000,
        new Date(),
        null,
        50000,
        'PYG',
        new Date(),
        new Date(),
      );

      (mockExpenseRepository.findByUserId as jest.Mock).mockResolvedValue({
        data: [expense],
        total: 1,
      });

      mockExchangeRateService.getBatchRates.mockResolvedValue({});

      const result = await useCase.execute({
        userId: 'user1',
        pagination: { page: 1, limit: 10 },
      });

      expect(result.expenses[0].amount).toBe(50000);
      expect(result.expenses[0].originalCurrency).toBe('PYG');
    });
  });
});
