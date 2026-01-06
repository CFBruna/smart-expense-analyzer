import { Test, TestingModule } from '@nestjs/testing';
import { ListExpensesUseCase } from './list-expenses.use-case';
import { EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository.interface';
import { Expense } from '../../../domain/entities/expense.entity';

describe('ListExpensesUseCase', () => {
  let useCase: ListExpensesUseCase;
  let mockExpenseRepository: any;

  beforeEach(async () => {
    mockExpenseRepository = {
      findByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListExpensesUseCase,
        { provide: EXPENSE_REPOSITORY, useValue: mockExpenseRepository },
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

      expect(mockExpenseRepository.findByUserId).toHaveBeenCalledWith('user123', 2, 10);

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
  });
});
