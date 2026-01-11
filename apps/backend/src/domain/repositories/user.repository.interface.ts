import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  exists(email: string): Promise<boolean>;
  update(id: string, updates: Partial<User>): Promise<User>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
