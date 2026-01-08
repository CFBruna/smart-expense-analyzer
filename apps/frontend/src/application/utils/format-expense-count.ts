import { Translations } from '@domain/types/language.types';

/**
 * Formats expense count with proper singular/plural form
 * @param count - Number of expenses
 * @param t - Translations object
 * @returns Formatted string like "1 expense" or "5 expenses"
 */
export function formatExpenseCount(count: number, t: Translations): string {
    const word = count === 1 ? t.dashboard.expense : t.dashboard.expenses;
    return `${count} ${word}`;
}
