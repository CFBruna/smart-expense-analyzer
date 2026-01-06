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

  describe('isHigh', () => {
    it('should return true when confidence >= 0.7', () => {
      const category = new Category('Food', null, [], 0.8);
      expect(category.isHigh()).toBe(true);
    });

    it('should return false when confidence < 0.7', () => {
      const category = new Category('Food', null, [], 0.5);
      expect(category.isHigh()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format with secondary category when present', () => {
      const category = new Category('Food', 'Groceries', [], 0.9);
      expect(category.toString()).toBe('Food > Groceries');
    });

    it('should format without secondary category when null', () => {
      const category = new Category('Food', null, [], 0.9);
      expect(category.toString()).toBe('Food');
    });
  });
});
