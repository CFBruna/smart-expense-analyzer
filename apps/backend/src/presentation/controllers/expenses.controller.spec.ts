import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { CreateExpenseUseCase } from '../../application/use-cases/expenses/create-expense.use-case';
import { ListExpensesUseCase } from '../../application/use-cases/expenses/list-expenses.use-case';
import { Expense } from '../../domain/entities/expense.entity';
import { Category } from '../../domain/value-objects/category.vo';
import { JwtAuthService } from '../../infrastructure/auth/jwt-auth.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let mockCreateUseCase: any;
  let mockListUseCase: any;

  beforeEach(async () => {
    mockCreateUseCase = {
      execute: jest.fn(),
    };

    mockListUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        { provide: CreateExpenseUseCase, useValue: mockCreateUseCase },
        { provide: ListExpensesUseCase, useValue: mockListUseCase },
        { provide: JwtAuthService, useValue: { verifyToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      description: 'Uber to dentist',
      amount: 25.5,
      date: '2026-01-04T00:00:00Z',
    };

    const mockRequest = {
      user: { id: 'user123', email: 'test@example.com' },
    };

    it('should create expense', async () => {
      const category = new Category('Transportation', 'Ride-sharing', ['uber'], 0.9);
      const expense = new Expense(
        '123',
        'user123',
        dto.description,
        dto.amount,
        new Date(dto.date),
        category,
      );

      mockCreateUseCase.execute.mockResolvedValue(expense);

      const result = await controller.create(mockRequest, dto);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith({
        userId: mockRequest.user.id,
        description: dto.description,
        amount: dto.amount,
        date: new Date(dto.date),
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('category');
      expect(result.category).toHaveProperty('primary');
    });
  });

  describe('list', () => {
    const mockRequest = {
      user: { id: 'user123', email: 'test@example.com' },
    };

    it('should list expenses with pagination', async () => {
      const expenses = [
        new Expense('1', 'user123', 'Test1', 10, new Date(), null),
        new Expense('2', 'user123', 'Test2', 20, new Date(), null),
      ];

      const mockResult = {
        expenses,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockListUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.list(mockRequest, 1, 20);

      expect(mockListUseCase.execute).toHaveBeenCalledWith({
        userId: mockRequest.user.id,
        pagination: { page: 1, limit: 20 },
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });
});
