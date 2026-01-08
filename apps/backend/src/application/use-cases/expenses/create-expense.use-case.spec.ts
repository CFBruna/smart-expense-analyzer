import { Test, TestingModule } from '@nestjs/testing';
import { CreateExpenseUseCase } from './create-expense.use-case';
import { EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository.interface';
import { CATEGORY_REPOSITORY } from '../../../domain/repositories/category.repository.interface';
import { LangchainCategorizationService } from '../../../infrastructure/ai/langchain-categorization.service';
import { Expense } from '../../../domain/entities/expense.entity';
import { Category } from '../../../domain/value-objects/category.vo';

describe('CreateExpenseUseCase', () => {
  let useCase: CreateExpenseUseCase;
  let mockExpenseRepository: any;
  let mockCategoryRepository: any;
  let mockAiService: any;

  beforeEach(async () => {
    mockExpenseRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
    };

    mockCategoryRepository = {
      findByUserId: jest.fn(),
      findDefaults: jest.fn(),
    };

    mockAiService = {
      categorize: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateExpenseUseCase,
        { provide: EXPENSE_REPOSITORY, useValue: mockExpenseRepository },
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepository },
        {
          provide: LangchainCategorizationService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    useCase = module.get<CreateExpenseUseCase>(CreateExpenseUseCase);
  });

  describe('execute', () => {
    const command = {
      userId: 'user123',
      description: 'Uber to dentist',
      amount: 25.5,
      date: new Date('2026-01-04'),
    };

    it('should create expense with AI categorization', async () => {
      const category = new Category('Transportation', 'Ride-sharing', ['uber'], 0.9);
      const expense = new Expense(
        '123',
        command.userId,
        command.description,
        command.amount,
        command.date,
        category,
      );

      mockExpenseRepository.create.mockResolvedValue(expense);
      mockExpenseRepository.findByUserId.mockResolvedValue({ data: [], total: 0 });
      mockCategoryRepository.findByUserId.mockResolvedValue([]);
      mockAiService.categorize.mockResolvedValue(category);

      const result = await useCase.execute(command);

      expect(mockExpenseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: command.userId,
          description: command.description,
          amount: command.amount,
          date: command.date,
        }),
      );

      expect(result).toBeInstanceOf(Expense);
      expect(result.userId).toBe(command.userId);
      expect(result.description).toBe(command.description);
      expect(result.amount).toBe(command.amount);
    });

    it('should call AI service before creating expense', async () => {
      const category = new Category('Food', null, [], 0.8);
      const expense = new Expense(
        '123',
        command.userId,
        command.description,
        command.amount,
        command.date,
        null,
      );

      mockExpenseRepository.create.mockResolvedValue(expense);
      mockExpenseRepository.findByUserId.mockResolvedValue({ data: [], total: 0 });
      mockCategoryRepository.findByUserId.mockResolvedValue([]);
      mockAiService.categorize.mockResolvedValue(category);

      await useCase.execute(command);

      expect(mockExpenseRepository.create).toHaveBeenCalled();
    });
  });
});
