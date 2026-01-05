import { Expense } from './expense.entity';
import { Category } from '../value-objects/category.vo';

describe('Expense Entity', () => {
  const validCategory = new Category('Food', 'Groceries', ['supermarket'], 0.9);

  describe('constructor', () => {
    it('should create a valid expense', () => {
      const date = new Date();
      const expense = new Expense('123', 'user123', 'Grocery shopping', 150.0, date, validCategory);

      expect(expense.id).toBe('123');
      expect(expense.userId).toBe('user123');
      expect(expense.description).toBe('Grocery shopping');
      expect(expense.amount).toBe(150.0);
      expect(expense.date).toBe(date);
      expect(expense.category).toBe(validCategory);
      expect(expense.createdAt).toBeInstanceOf(Date);
      expect(expense.updatedAt).toBeInstanceOf(Date);
    });

    it('should create expense without category', () => {
      const expense = new Expense(null, 'user123', 'Test expense', 10.0, new Date(), null);

      expect(expense.category).toBeNull();
    });
  });

  describe('amount validation', () => {
    it('should accept positive amounts', () => {
      expect(() => {
        new Expense(null, 'user123', 'Test', 0.01, new Date(), null);
      }).not.toThrow();

      expect(() => {
        new Expense(null, 'user123', 'Test', 1000.5, new Date(), null);
      }).not.toThrow();
    });

    it('should reject zero amount', () => {
      expect(() => {
        new Expense(null, 'user123', 'Test', 0, new Date(), null);
      }).toThrow('Amount must be greater than 0');
    });

    it('should reject negative amount', () => {
      expect(() => {
        new Expense(null, 'user123', 'Test', -10, new Date(), null);
      }).toThrow('Amount must be greater than 0');
    });
  });

  describe('description validation', () => {
    it('should accept valid descriptions', () => {
      expect(() => {
        new Expense(null, 'user123', 'A', 10, new Date(), null);
      }).not.toThrow();

      expect(() => {
        new Expense(null, 'user123', 'A'.repeat(500), 10, new Date(), null);
      }).not.toThrow();
    });

    it('should reject empty description', () => {
      expect(() => {
        new Expense(null, 'user123', '', 10, new Date(), null);
      }).toThrow('Description cannot be empty');
    });

    it('should reject description with only whitespace', () => {
      expect(() => {
        new Expense(null, 'user123', '   ', 10, new Date(), null);
      }).toThrow('Description cannot be empty');
    });

    it('should reject description longer than 500 characters', () => {
      expect(() => {
        new Expense(null, 'user123', 'A'.repeat(501), 10, new Date(), null);
      }).toThrow('Description cannot exceed 500 characters');
    });
  });

  describe('userId validation', () => {
    it('should reject empty userId', () => {
      expect(() => {
        new Expense(null, '', 'Test', 10, new Date(), null);
      }).toThrow('UserId cannot be empty');
    });

    it('should reject userId with only whitespace', () => {
      expect(() => {
        new Expense(null, '   ', 'Test', 10, new Date(), null);
      }).toThrow('UserId cannot be empty');
    });
  });

  describe('withCategory', () => {
    it('should return new expense with category', () => {
      const expense = new Expense('123', 'user123', 'Test', 10, new Date(), null);

      const newExpense = expense.withCategory(validCategory);

      expect(newExpense).not.toBe(expense);
      expect(newExpense.category).toBe(validCategory);
      expect(newExpense.id).toBe(expense.id);
      expect(newExpense.userId).toBe(expense.userId);
      expect(newExpense.description).toBe(expense.description);
      expect(newExpense.amount).toBe(expense.amount);
      expect(newExpense.date).toBe(expense.date);
      expect(newExpense.updatedAt).not.toBe(expense.updatedAt);
    });
  });

  describe('isPending', () => {
    it('should return true when category is null', () => {
      const expense = new Expense(null, 'user123', 'Test', 10, new Date(), null);

      expect(expense.isPending()).toBe(true);
    });

    it('should return false when category exists', () => {
      const expense = new Expense(null, 'user123', 'Test', 10, new Date(), validCategory);

      expect(expense.isPending()).toBe(false);
    });
  });

  describe('isCategorized', () => {
    it('should return false when category is null', () => {
      const expense = new Expense(null, 'user123', 'Test', 10, new Date(), null);

      expect(expense.isCategorized()).toBe(false);
    });

    it('should return true when category exists', () => {
      const expense = new Expense(null, 'user123', 'Test', 10, new Date(), validCategory);

      expect(expense.isCategorized()).toBe(true);
    });
  });
});
