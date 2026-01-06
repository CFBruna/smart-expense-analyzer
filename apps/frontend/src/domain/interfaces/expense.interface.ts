export interface Category {
    primary: string;
    secondary: string | null;
    tags: string[];
    confidence: number;
    rationale?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: Category | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseDto {
    description: string;
    amount: number;
    date: string;
}

export interface ExpenseListResponse {
    data: Expense[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
