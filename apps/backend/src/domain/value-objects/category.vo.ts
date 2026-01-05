export class Category {
  constructor(
    public readonly primary: string,
    public readonly secondary: string | null,
    public readonly tags: string[],
    public readonly confidence: number,
    public readonly rationale?: string,
  ) {
    this.validatePrimary(primary);
    this.validateConfidence(confidence);
  }

  private validatePrimary(primary: string): void {
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

    if (!validCategories.includes(primary)) {
      throw new Error(
        `Invalid primary category: ${primary}. Must be one of: ${validCategories.join(', ')}`,
      );
    }
  }

  private validateConfidence(confidence: number): void {
    if (confidence < 0 || confidence > 1) {
      throw new Error(`Confidence must be between 0 and 1, received: ${confidence}`);
    }
  }

  isHighConfidence(): boolean {
    return this.confidence >= 0.8;
  }

  equals(other: Category): boolean {
    return (
      this.primary === other.primary &&
      this.secondary === other.secondary &&
      JSON.stringify(this.tags.sort()) === JSON.stringify(other.tags.sort())
    );
  }
}
