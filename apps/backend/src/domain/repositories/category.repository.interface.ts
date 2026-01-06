import { Category } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
