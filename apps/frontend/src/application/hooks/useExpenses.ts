import { useState, useEffect, useCallback } from 'react';
import { Expense, CreateExpenseDto } from '@domain/interfaces/expense.interface';
import { expenseService, DateFilters } from '../services/expense.service';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateFilters, setDateFilters] = useState<DateFilters | undefined>(undefined);

    const loadExpenses = useCallback(async (page = 1, limit = 20, filters?: DateFilters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await expenseService.listExpenses(page, limit, filters);
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
        await loadExpenses(meta.page, meta.limit, dateFilters);
        return newExpense;
    }, [loadExpenses, meta.page, meta.limit, dateFilters]);

    const updateExpense = useCallback(async (id: string, data: Partial<CreateExpenseDto> & {
        manualCategory?: {
            primary: string;
            secondary?: string | null;
        };
    }) => {
        await expenseService.updateExpense(id, data);
        await loadExpenses(meta.page, meta.limit, dateFilters);
    }, [loadExpenses, meta.page, meta.limit, dateFilters]);

    const deleteExpense = useCallback(async (id: string) => {
        await expenseService.deleteExpense(id);
        const remainingOnPage = expenses.length - 1;
        if (remainingOnPage === 0 && meta.page > 1) {
            await loadExpenses(meta.page - 1, meta.limit, dateFilters);
        } else {
            await loadExpenses(meta.page, meta.limit, dateFilters);
        }
    }, [loadExpenses, meta.page, meta.limit, expenses.length, dateFilters]);

    const applyDateFilters = useCallback((filters: DateFilters | undefined) => {
        setDateFilters(filters);
        loadExpenses(1, meta.limit, filters);
    }, [loadExpenses, meta.limit]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    return {
        expenses,
        meta,
        loading,
        error,
        dateFilters,
        loadExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        applyDateFilters,
    };
};

