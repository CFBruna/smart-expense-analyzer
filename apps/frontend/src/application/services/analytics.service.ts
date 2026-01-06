import { AnalyticsSummary } from '@domain/interfaces/analytics.interface';
import { apiClient } from '@infrastructure/http/axios-client';

export class AnalyticsService {
    async getAnalyticsSummary(): Promise<AnalyticsSummary> {
        return apiClient.get<AnalyticsSummary>('/analytics/summary');
    }
}

export const analyticsService = new AnalyticsService();
