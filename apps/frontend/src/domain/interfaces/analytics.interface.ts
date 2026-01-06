export interface CategoryBreakdown {
    category: string;
    total: number;
    count: number;
    percentage: number;
}

export interface AnalyticsSummary {
    totalSpent: number;
    categoryBreakdown: CategoryBreakdown[];
    period: {
        startDate?: string;
        endDate?: string;
    };
}
