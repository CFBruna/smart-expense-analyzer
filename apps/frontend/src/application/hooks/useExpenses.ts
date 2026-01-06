import { useState, useEffect, useCallback } from 'react';
import { Expense, CreateExpenseDto } from '@domain/interfaces/expense.interface';
import { expenseService } from '../services/expense.service';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadExpenses = useCallback(async (page = 1, limit = 20) => {
        try {
            setLoading(true);
            setError(null);
            const response = await expenseService.listExpenses(page, limit);
            setExpenses(response.data);
            setMeta(response.meta);
        } catch (err) {
            setError('Failed to load expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createExpense = useCallback(async (data: CreateExpenseDto) => {
        const newExpense = await expenseService.createExpense(data);
        await loadExpenses(meta.page, meta.limit);
        return newExpense;
    }, [loadExpenses, meta.page, meta.limit]);

    const updateExpense = useCallback(async (id: string, data: Partial<CreateExpenseDto> & {
        manualCategory?: {
            primary: string;
            secondary?: string | null;
        };
    }) => {
        await expenseService.updateExpense(id, data);
        await loadExpenses(meta.page, meta.limit);
    }, [loadExpenses, meta.page, meta.limit]);

    const deleteExpense = useCallback(async (id: string) => {
        await expenseService.deleteExpense(id);
        const remainingOnPage = expenses.length - 1;
        if (remainingOnPage === 0 && meta.page > 1) {
            await loadExpenses(meta.page - 1, meta.limit);
        } else {
            await loadExpenses(meta.page, meta.limit);
        }
    }, [loadExpenses, meta.page, meta.limit, expenses.length]);

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
