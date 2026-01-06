import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../domain/repositories/category.repository.interface';
import { Category } from '../../../domain/entities/category.entity';

export interface CreateCategoryInput {
  userId: string;
  name: string;
  color: string;
  icon: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const category = new Category(
      null,
      input.userId,
      input.name,
      input.color,
      input.icon,
      false,
      new Date(),
      new Date(),
    );

    try {
      return await this.categoryRepository.create(category);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException('Category name already exists');
      }
      throw error;
    }
  }
}
