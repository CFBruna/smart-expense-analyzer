import { useState, useEffect } from 'react';
import { AnalyticsSummary } from '@domain/interfaces/analytics.interface';
import { analyticsService } from '../services/analytics.service';

export const useAnalytics = () => {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyticsService.getAnalyticsSummary();
            setData(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    return { data, loading, error, reload: loadAnalytics };
};
