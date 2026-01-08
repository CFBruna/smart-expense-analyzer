import { AnalyticsSummary } from '@domain/interfaces/analytics.interface';
import { apiClient } from '@infrastructure/http/axios-client';

export interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
}

export class AnalyticsService {
    async getAnalyticsSummary(filters?: AnalyticsFilters): Promise<AnalyticsSummary> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        const query = params.toString();
        return apiClient.get<AnalyticsSummary>(`/analytics/summary${query ? `?${query}` : ''}`);
    }
}

export const analyticsService = new AnalyticsService();

