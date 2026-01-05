import { useState, useEffect, useCallback } from 'react';
import { Expense, CreateExpenseDto, ExpenseListResponse } from '@domain/interfaces/expense.interface';
import { expenseService } from '../services/expense.service';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadExpenses = useCallback(async (page = 1, limit = 20) => {
        setLoading(true);
        setError(null);
        try {
            const result = await expenseService.listExpenses(page, limit);
            setExpenses(result.data);
            setMeta(result.meta);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load expenses';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createExpense = async (data: CreateExpenseDto): Promise<Expense> => {
        setError(null);
        try {
            const newExpense = await expenseService.createExpense(data);
            await loadExpenses(meta.page);
            return newExpense;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create expense';
            setError(message);
            throw err;
        }
    };

    const updateExpense = async (
        id: string,
        data: Partial<CreateExpenseDto>,
    ): Promise<Expense> => {
        setLoading(true);
        setError(null);
        try {
            const updatedExpense = await expenseService.updateExpense(id, data);
            await loadExpenses(meta.page);
            return updatedExpense;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update expense';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteExpense = async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await expenseService.deleteExpense(id);
            await loadExpenses(meta.page);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete expense';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    return {
        expenses,
        meta,
        loading,
        error,
        loadExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
    };
};
