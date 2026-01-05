import { User } from './user.entity';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a valid user', () => {
      const user = new User('123', 'test@example.com', 'hashedPassword', 'Test User');

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashedPassword');
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create user with null id', () => {
      const user = new User(null, 'test@example.com', 'hashedPassword', 'Test User');

      expect(user.id).toBeNull();
    });
  });

  describe('email validation', () => {
    it('should accept valid email formats', () => {
      const validEmails = ['test@example.com', 'user.name@example.co.uk', 'user+tag@example.com'];

      validEmails.forEach((email) => {
        expect(() => {
          new User(null, email, 'hash', 'Name');
        }).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = ['invalid-email', '@example.com', 'user@', 'user @example.com', ''];

      invalidEmails.forEach((email) => {
        expect(() => {
          new User(null, email, 'hash', 'Name');
        }).toThrow('Invalid email format');
      });
    });
  });

  describe('name validation', () => {
    it('should accept valid names', () => {
      const validNames = ['Jo', 'John Doe', 'A'.repeat(100)];

      validNames.forEach((name) => {
        expect(() => {
          new User(null, 'test@example.com', 'hash', name);
        }).not.toThrow();
      });
    });

    it('should reject empty name', () => {
      expect(() => {
        new User(null, 'test@example.com', 'hash', '');
      }).toThrow('Name cannot be empty');
    });

    it('should reject name with only whitespace', () => {
      expect(() => {
        new User(null, 'test@example.com', 'hash', '   ');
      }).toThrow('Name cannot be empty');
    });

    it('should reject name shorter than 2 characters', () => {
      expect(() => {
        new User(null, 'test@example.com', 'hash', 'A');
      }).toThrow('Name must be between 2 and 100 characters');
    });

    it('should reject name longer than 100 characters', () => {
      expect(() => {
        new User(null, 'test@example.com', 'hash', 'A'.repeat(101));
      }).toThrow('Name must be between 2 and 100 characters');
    });
  });

  describe('equals', () => {
    it('should return true for users with same email', () => {
      const user1 = new User('1', 'test@example.com', 'hash1', 'User 1');
      const user2 = new User('2', 'test@example.com', 'hash2', 'User 2');

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for users with different emails', () => {
      const user1 = new User('1', 'test1@example.com', 'hash', 'User 1');
      const user2 = new User('1', 'test2@example.com', 'hash', 'User 2');

      expect(user1.equals(user2)).toBe(false);
    });
  });
});
