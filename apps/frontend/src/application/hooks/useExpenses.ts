import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { CreateExpenseDto } from '@domain/interfaces/expense.interface';
import { expenseService, DateFilters, UpdateExpenseData } from '../services/expense.service';
import { useCurrency } from '../contexts/CurrencyContext';

export const useExpenses = () => {
    const { currency, isLoadingInitial } = useCurrency();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [dateFilters, setDateFilters] = useState<DateFilters | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const queryKey = ['expenses', { page, limit, dateFilters, sortOrder, currency }];

    const {
        data: response,
        isLoading,
        isError,
        error: queryError,
    } = useQuery({
        queryKey,
        queryFn: () => expenseService.listExpenses(page, limit, dateFilters, sortOrder),
        placeholderData: keepPreviousData,
        enabled: !isLoadingInitial,
        staleTime: 1000 * 60,
        refetchInterval: (query) => {
            const data = query.state.data?.data;
            if (data?.some((e) => !e.category)) {
                return 3000;
            }
            return false;
        },
    });

    const expenses = response?.data || [];
    const meta = response?.meta || { page, limit: 20, total: 0, totalPages: 0 };
    const error = isError ? (queryError as Error).message : null;

    const createMutation = useMutation({
        mutationFn: (data: CreateExpenseDto) => expenseService.createExpense(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) =>
            expenseService.updateExpense(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => expenseService.deleteExpense(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });

    const loadExpenses = useCallback((newPage?: number, newLimit?: number, newFilters?: DateFilters, newSort?: 'asc' | 'desc') => {
        if (newPage !== undefined) setPage(newPage);
        if (newLimit !== undefined) setLimit(newLimit);
        if (newFilters !== undefined) setDateFilters(newFilters);
        if (newSort !== undefined) setSortOrder(newSort);
    }, []);

    const createExpense = async (data: CreateExpenseDto) => {
        return createMutation.mutateAsync(data);
    };

    const updateExpense = async (id: string, data: UpdateExpenseData) => {
        return updateMutation.mutateAsync({ id, data });
    };

    const deleteExpense = async (id: string) => {
        return deleteMutation.mutateAsync(id);
    };

    const applyDateFilters = useCallback((filters: DateFilters | undefined) => {
        setDateFilters(filters);
        setPage(1);
    }, []);

    const applySort = useCallback((order: 'asc' | 'desc') => {
        setSortOrder(order);
        setPage(1);
    }, []);

    return {
        expenses,
        meta,
        loading: isLoading || isLoadingInitial || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        error,
        dateFilters,
        sortOrder,
        loadExpenses,
        createExpense,
        updateExpense,
        deleteExpense,
        applyDateFilters,
        applySort,
        setPage,
    };
};
