export class Category {
  constructor(
    public readonly primary: string,
    public readonly secondary: string | null,
    public readonly tags: string[],
    public readonly confidence: number,
    public readonly rationale?: string,
  ) { }

  isHigh(): boolean {
    return this.confidence >= 0.7;
  }

  toString(): string {
    return this.secondary ? `${this.primary} > ${this.secondary}` : this.primary;
  }
}
