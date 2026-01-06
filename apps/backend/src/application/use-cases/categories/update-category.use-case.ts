import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export interface UpdateCategoryInput {
  id: string;
  userId: string;
  name?: string;
  color?: string;
  icon?: string;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<Category> {
    const category = await this.categoryRepository.findById(input.id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${input.id} not found`);
    }

    if (category.userId !== input.userId) {
      throw new NotFoundException(`Category with ID ${input.id} not found`);
    }

    if (category.isDefault) {
      throw new ForbiddenException('Cannot modify default categories');
    }

    if (input.name !== undefined) {
      category.name = input.name;
    }
    if (input.color !== undefined) {
      category.color = input.color;
    }
    if (input.icon !== undefined) {
      category.icon = input.icon;
    }

    category.updatedAt = new Date();

    return await this.categoryRepository.update(category);
  }
}
