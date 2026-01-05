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
    ) { }

    async execute(query: ListCategoriesQuery): Promise<Category[]> {
        return await this.categoryRepository.findByUserId(query.userId);
    }
}
