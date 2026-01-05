import { Test, TestingModule } from '@nestjs/testing';
import { CreateExpenseUseCase } from './create-expense.use-case';
import { EXPENSE_REPOSITORY } from '../../../domain/repositories/expense.repository.interface';
import { LangchainCategorizationService } from '../../../infrastructure/ai/langchain-categorization.service';
import { Expense } from '../../../domain/entities/expense.entity';
import { Category } from '../../../domain/value-objects/category.vo';

describe('CreateExpenseUseCase', () => {
  let useCase: CreateExpenseUseCase;
  let mockExpenseRepository: any;
  let mockAiService: any;

  beforeEach(async () => {
    mockExpenseRepository = {
      create: jest.fn(),
    };

    mockAiService = {
      categorize: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateExpenseUseCase,
        { provide: EXPENSE_REPOSITORY, useValue: mockExpenseRepository },
        {
          provide: LangchainCategorizationService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    useCase = module.get<CreateExpenseUseCase>(CreateExpenseUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const command = {
      userId: 'user123',
      description: 'Uber to dentist',
      amount: 25.5,
      date: new Date('2026-01-04'),
    };

    const category = new Category('Transportation', 'Ride-sharing', ['uber'], 0.9);

    it('should create expense with AI categorization', async () => {
      mockAiService.categorize.mockResolvedValue(category);
      mockExpenseRepository.create.mockImplementation((expense: Expense) =>
        Promise.resolve(expense),
      );

      await useCase.execute(command);

      expect(mockAiService.categorize).toHaveBeenCalledWith(command.description, command.amount);
      expect(mockExpenseRepository.create).toHaveBeenCalled();

      const createdExpense = mockExpenseRepository.create.mock.calls[0][0];
      expect(createdExpense.userId).toBe(command.userId);
      expect(createdExpense.description).toBe(command.description);
      expect(createdExpense.amount).toBe(command.amount);
      expect(createdExpense.date).toBe(command.date);
      expect(createdExpense.category).toBe(category);
    });

    it('should call AI service before creating expense', async () => {
      const callOrder: string[] = [];

      mockAiService.categorize.mockImplementation(() => {
        callOrder.push('categorize');
        return Promise.resolve(category);
      });

      mockExpenseRepository.create.mockImplementation(() => {
        callOrder.push('create');
        return Promise.resolve(new Expense(null, 'user', 'test', 10, new Date(), category));
      });

      await useCase.execute(command);

      expect(callOrder).toEqual(['categorize', 'create']);
    });
  });
});
