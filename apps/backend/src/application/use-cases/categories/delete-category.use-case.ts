import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import {
  IExpenseRepository,
  EXPENSE_REPOSITORY,
} from '../../../domain/repositories/expense.repository.interface';
import { RedisCacheService } from '../../../infrastructure/cache/redis-cache.service';

export interface DeleteCategoryInput {
  id: string;
  userId: string;
}

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(EXPENSE_REPOSITORY)
    private readonly expenseRepository: IExpenseRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async execute(input: DeleteCategoryInput): Promise<void> {
    const category = await this.categoryRepository.findById(input.id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${input.id} not found`);
    }

    if (category.userId !== input.userId) {
      throw new NotFoundException(`Category with ID ${input.id} not found`);
    }

    if (category.isDefault) {
      throw new ForbiddenException('Cannot delete default categories');
    }

    await this.categoryRepository.delete(input.id);

    await this.cacheService.invalidateUserCategoryCache(input.userId);
  }
}
