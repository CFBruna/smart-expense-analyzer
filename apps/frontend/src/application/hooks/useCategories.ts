import { useState, useEffect, useCallback } from 'react';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@domain/interfaces/category.interface';
import { categoryService } from '../services/category.service';

export const useCategories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await categoryService.list();
            setCategories(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load categories';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
        setError(null);
        try {
            const newCategory = await categoryService.create(data);
            await loadCategories();
            return newCategory;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create category';
            setError(message);
            throw err;
        }
    };

    const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
        setLoading(true);
        setError(null);
        try {
            const updated = await categoryService.update(id, data);
            await loadCategories();
            return updated;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update category';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await categoryService.delete(id);
            await loadCategories();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete category';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    return {
        categories,
        loading,
        error,
        loadCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
};
