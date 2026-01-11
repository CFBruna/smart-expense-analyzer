import { useState } from 'react';
import { Edit2, Trash2, Calendar, Tag, Loader2 } from 'lucide-react';
import { useCurrency } from '@application/contexts/CurrencyContext';
import { useLanguage } from '@application/contexts/LanguageContext';
import { formatCurrency, CurrencyCode } from '@domain/types/currency.types';
import { translateCategory } from '@application/utils/translate-category';
import { Expense } from '@domain/interfaces/expense.interface';

interface ExpenseListProps {
    expenses: Expense[];
    loading: boolean;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => Promise<void>;
}

export const ExpenseList = ({ expenses, loading, onEdit, onDelete }: ExpenseListProps) => {
    const { currency } = useCurrency();
    const { t, language } = useLanguage();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await onDelete(id);
            setConfirmDeleteId(null);
        } catch (error) {
            console.error('Failed to delete', error);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-gray-500">{t.dashboard.noExpenses}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {expenses.map((expense) => (
                <div key={expense.id} className="card hover:shadow-md transition-shadow">
                    {confirmDeleteId === expense.id ? (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">{t.modals.deleteTitle}</h4>
                            <p className="text-sm text-red-700 mb-4">{t.modals.deleteMessage}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDelete(expense.id)}
                                    disabled={deletingId === expense.id}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                >
                                    {deletingId === expense.id ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {t.modals.deleting}
                                        </>
                                    ) : (
                                        t.actions.confirm
                                    )}
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    {t.actions.cancel}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Title and Actions Row */}
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900 text-base flex-1">{expense.description}</h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(expense)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title={t.actions.edit}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteId(expense.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title={t.actions.delete}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div>
                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(expense.date).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')} {new Date(expense.date).toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="font-semibold text-gray-900">
                                            {formatCurrency(expense.amount, currency)}
                                        </div>
                                        {expense.originalCurrency && expense.originalCurrency !== currency && (
                                            <div className="text-xs text-gray-500">
                                                {t.dashboard.convertedFrom} {formatCurrency(expense.originalAmount || expense.amount, expense.originalCurrency as CurrencyCode)}
                                            </div>
                                        )}
                                    </div>

                                </div>
                                {expense.category && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Tag size={14} className="text-primary-600" />
                                        <span className="text-sm font-medium text-primary-600">
                                            {translateCategory(expense.category.primary, language)}
                                        </span>
                                    </div>
                                )}
                                {!expense.category && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-blue-600" />
                                        <span className="text-sm text-blue-600 animate-pulse">
                                            Analisando com IA...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
