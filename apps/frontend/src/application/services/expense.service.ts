import {
    Expense,
    CreateExpenseDto,
    ExpenseListResponse,
} from '@domain/interfaces/expense.interface';
import { apiClient } from '@infrastructure/http/axios-client';

export interface UpdateExpenseData {
    description?: string;
    amount?: number;
    date?: string;
    manualCategory?: {
        primary: string;
        secondary?: string | null;
    };
}

export interface DateFilters {
    startDate?: string;
    endDate?: string;
}

export class ExpenseService {
    async listExpenses(page = 1, limit = 20, filters?: DateFilters): Promise<ExpenseListResponse> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        return apiClient.get<ExpenseListResponse>(`/expenses?${params.toString()}`);
    }

    async createExpense(data: CreateExpenseDto): Promise<Expense> {
        return apiClient.post<Expense>('/expenses', data);
    }

    async updateExpense(id: string, data: UpdateExpenseData): Promise<Expense> {
        return apiClient.put<Expense>(`/expenses/${id}`, data);
    }

    async deleteExpense(id: string): Promise<void> {
        await apiClient.delete(`/expenses/${id}`);
    }
}

export const expenseService = new ExpenseService();
