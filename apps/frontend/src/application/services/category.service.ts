import { Category, CreateCategoryDto, UpdateCategoryDto } from '@domain/interfaces/category.interface';
import { apiClient } from '@infrastructure/http/axios-client';

export class CategoryService {
    async list(): Promise<Category[]> {
        return apiClient.get<Category[]>('/categories');
    }

    async create(data: CreateCategoryDto): Promise<Category> {
        return apiClient.post<Category>('/categories', data);
    }

    async update(id: string, data: UpdateCategoryDto): Promise<Category> {
        return apiClient.put<Category>(`/categories/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/categories/${id}`);
    }
}

export const categoryService = new CategoryService();
