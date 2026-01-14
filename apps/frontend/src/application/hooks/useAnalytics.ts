import { useState, useEffect, useCallback } from 'react';
import { AnalyticsSummary } from '@domain/interfaces/analytics.interface';
import { analyticsService, AnalyticsFilters } from '../services/analytics.service';
import { useCurrency } from '../contexts/CurrencyContext';

export const useAnalytics = () => {
    const { currency } = useCurrency();
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateFilters, setDateFilters] = useState<AnalyticsFilters | undefined>(undefined);

    const loadAnalytics = useCallback(async (filters?: AnalyticsFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getAnalyticsSummary(filters);
            setData(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    const applyDateFilters = useCallback((filters: AnalyticsFilters | undefined) => {
        setDateFilters(filters);
        loadAnalytics(filters);
    }, [loadAnalytics]);

    useEffect(() => {
        loadAnalytics(dateFilters);
    }, [loadAnalytics, dateFilters, currency]);

    return { data, loading, error, dateFilters, applyDateFilters };
};

