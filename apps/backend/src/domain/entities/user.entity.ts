export class User {
  constructor(
    public readonly id: string | null,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateEmail(email);
    this.validateName(name);
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    if (name.length < 2 || name.length > 100) {
      throw new Error('Name must be between 2 and 100 characters');
    }
  }

  equals(other: User): boolean {
    return this.email === other.email;
  }
}
