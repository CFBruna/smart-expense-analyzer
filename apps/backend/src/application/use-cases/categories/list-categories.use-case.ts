import { Injectable, Inject } from '@nestjs/common';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export interface ListCategoriesQuery {
  userId: string;
}

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(query: ListCategoriesQuery): Promise<Category[]> {
    const [defaultCategories, userCategories] = await Promise.all([
      this.categoryRepository.findDefaults(),
      this.categoryRepository.findByUserId(query.userId),
    ]);

    return [...defaultCategories, ...userCategories];
  }
}
