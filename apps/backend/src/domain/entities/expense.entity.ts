import { Category } from '../value-objects/category.vo';

export class Expense {
  constructor(
    public readonly id: string | null,
    public readonly userId: string,
    public readonly description: string,
    public readonly amount: number,
    public readonly date: Date,
    public category: Category | null, // Made mutable for async updates
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validateAmount(amount);
    this.validateDescription(description);
    this.validateUserId(userId);
  }

  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }

    if (description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('UserId cannot be empty');
    }
  }

  withCategory(category: Category): Expense {
    return new Expense(
      this.id,
      this.userId,
      this.description,
      this.amount,
      this.date,
      category,
      this.createdAt,
      new Date(),
    );
  }

  isPending(): boolean {
    return this.category === null;
  }

  isCategorized(): boolean {
    return this.category !== null;
  }
}
