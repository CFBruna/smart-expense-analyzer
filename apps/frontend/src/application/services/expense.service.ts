import {
    Expense,
    CreateExpenseDto,
    ExpenseListResponse,
} from '@domain/interfaces/expense.interface';
import { apiClient } from '@infrastructure/http/axios-client';

export class ExpenseService {
    async listExpenses(page = 1, limit = 20): Promise<ExpenseListResponse> {
        return apiClient.get<ExpenseListResponse>(`/expenses?page=${page}&limit=${limit}`);
    }

    async createExpense(data: CreateExpenseDto): Promise<Expense> {
        return apiClient.post<Expense>('/expenses', data);
    }

    async updateExpense(id: string, data: Partial<CreateExpenseDto>): Promise<Expense> {
        return apiClient.put<Expense>(`/expenses/${id}`, data);
    }

    async deleteExpense(id: string): Promise<void> {
        await apiClient.delete(`/expenses/${id}`);
    }
}

export const expenseService = new ExpenseService();
