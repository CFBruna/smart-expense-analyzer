import { Category } from './category.vo';

describe('Category Value Object', () => {
  describe('constructor', () => {
    it('should create a valid category', () => {
      const category = new Category(
        'Food',
        'Groceries',
        ['supermarket', 'food'],
        0.85,
        'High confidence match',
      );

      expect(category.primary).toBe('Food');
      expect(category.secondary).toBe('Groceries');
      expect(category.tags).toEqual(['supermarket', 'food']);
      expect(category.confidence).toBe(0.85);
      expect(category.rationale).toBe('High confidence match');
    });

    it('should create category without secondary', () => {
      const category = new Category('Food', null, [], 0.9);

      expect(category.secondary).toBeNull();
    });

    it('should create category without rationale', () => {
      const category = new Category('Food', 'Groceries', [], 0.9);

      expect(category.rationale).toBeUndefined();
    });
  });

  describe('primary category validation', () => {
    const validCategories = [
      'Transportation',
      'Food',
      'Health',
      'Housing',
      'Entertainment',
      'Education',
      'Shopping',
      'Bills',
      'Other',
    ];

    it('should accept all valid primary categories', () => {
      validCategories.forEach((primary) => {
        expect(() => {
          new Category(primary, null, [], 0.9);
        }).not.toThrow();
      });
    });

    it('should reject invalid primary category', () => {
      expect(() => {
        new Category('InvalidCategory', null, [], 0.9);
      }).toThrow('Invalid primary category');
    });

    it('should be case-sensitive', () => {
      expect(() => {
        new Category('food', null, [], 0.9);
      }).toThrow('Invalid primary category');
    });
  });

  describe('confidence validation', () => {
    it('should accept confidence values between 0 and 1', () => {
      const validConfidences = [0, 0.5, 0.999, 1];

      validConfidences.forEach((confidence) => {
        expect(() => {
          new Category('Food', null, [], confidence);
        }).not.toThrow();
      });
    });

    it('should reject confidence below 0', () => {
      expect(() => {
        new Category('Food', null, [], -0.1);
      }).toThrow('Confidence must be between 0 and 1');
    });

    it('should reject confidence above 1', () => {
      expect(() => {
        new Category('Food', null, [], 1.1);
      }).toThrow('Confidence must be between 0 and 1');
    });
  });

  describe('isHighConfidence', () => {
    it('should return true for confidence >= 0.8', () => {
      expect(new Category('Food', null, [], 0.8).isHighConfidence()).toBe(true);
      expect(new Category('Food', null, [], 0.9).isHighConfidence()).toBe(true);
      expect(new Category('Food', null, [], 1.0).isHighConfidence()).toBe(true);
    });

    it('should return false for confidence < 0.8', () => {
      expect(new Category('Food', null, [], 0.79).isHighConfidence()).toBe(false);
      expect(new Category('Food', null, [], 0.5).isHighConfidence()).toBe(false);
      expect(new Category('Food', null, [], 0).isHighConfidence()).toBe(false);
    });
  });
});
