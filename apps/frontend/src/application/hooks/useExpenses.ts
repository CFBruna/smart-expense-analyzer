import { useState, useEffect, useCallback } from 'react';
import { Expense, CreateExpenseDto } from '@domain/interfaces/expense.interface';
import { expenseService, DateFilters } from '../services/expense.service';
import { useCurrency } from '../contexts/CurrencyContext';

export const useExpenses = () => {
    const { currency } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dateFilters, setDateFilters] = useState<DateFilters | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const loadExpenses = useCallback(async (page = 1, limit = 20, filters?: DateFilters, sort?: 'asc' | 'desc') => {
        try {
            setLoading(true);
            setError(null);
            const effectiveFilters = filters === undefined ? dateFilters : filters;
            const effectiveSort = sort || sortOrder;

            const response = await expenseService.listExpenses(page, limit, effectiveFilters, effectiveSort);
            setExpenses(response.data);
            setMeta(response.meta);
        } catch (err) {
            setError('Failed to load expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dateFilters, sortOrder]);

    const createExpense = useCallback(async (data: CreateExpenseDto) => {
        const newExpense = await expenseService.createExpense(data);
        await loadExpenses(meta.page, meta.limit, dateFilters, sortOrder);
        return newExpense;
    }, [loadExpenses, meta.page, meta.limit, dateFilters, sortOrder]);

    const updateExpense = useCallback(async (id: string, data: Partial<CreateExpenseDto> & {
        manualCategory?: {
            primary: string;
            secondary?: string | null;
        };
    }) => {
        await expenseService.updateExpense(id, data);
        await loadExpenses(meta.page, meta.limit, dateFilters, sortOrder);
    }, [loadExpenses, meta.page, meta.limit, dateFilters, sortOrder]);

    const deleteExpense = useCallback(async (id: string) => {
        await expenseService.deleteExpense(id);
        const remainingOnPage = expenses.length - 1;
        if (remainingOnPage === 0 && meta.page > 1) {
            await loadExpenses(meta.page - 1, meta.limit, dateFilters, sortOrder);
        } else {
            await loadExpenses(meta.page, meta.limit, dateFilters, sortOrder);
        }
    }, [loadExpenses, meta.page, meta.limit, expenses.length, dateFilters, sortOrder]);

    const applyDateFilters = useCallback((filters: DateFilters | undefined) => {
        setDateFilters(filters);
        loadExpenses(1, meta.limit, filters, sortOrder);
    }, [loadExpenses, meta.limit, sortOrder]);

    const applySort = useCallback((order: 'asc' | 'desc') => {
        setSortOrder(order);
        loadExpenses(1, meta.limit, dateFilters, order);
    }, [loadExpenses, meta.limit, dateFilters]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses, currency]);

    return {
        expenses,
        meta,
        loading,
        error,
        dateFilters,
        sortOrder,
        loadExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        applyDateFilters,
        applySort,
    };
};
