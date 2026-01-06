import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExpenses } from '@application/hooks/useExpenses';
import { useCategories } from '@application/hooks/useCategories';
import { Layout } from '@presentation/components/layout/Layout';
import { Plus, Calendar, Tag, Loader2, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useCurrency } from '@application/contexts/CurrencyContext';
import { formatCurrency } from '@domain/types/currency.types';
import { useLanguage } from '@application/contexts/LanguageContext';
import { translateCategory } from '@application/utils/translate-category';
import { Expense } from '@domain/interfaces/expense.interface';

const expenseSchema = z.object({
    description: z.string().min(2),
    amount: z.number().min(0.01),
    date: z.string(),
    categoryName: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export const DashboardPage = () => {
    const { expenses, loading, error, meta, loadExpenses, createExpense, updateExpense, deleteExpense } = useExpenses();
    const { categories } = useCategories();
    const { currency } = useCurrency();
    const { language, t } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data: ExpenseFormData) => {
        if (editingId) {
            setCreating(true);
            try {
                await updateExpense(editingId, {
                    description: data.description,
                    amount: data.amount,
                    date: data.date,
                    manualCategory: data.categoryName ? {
                        primary: data.categoryName,
                        secondary: null,
                    } : undefined,
                });
                setEditingId(null);
                setShowForm(false);
                reset();
            } catch (err) {
                console.error('Failed to update expense:', err);
            } finally {
                setCreating(false);
            }
        } else {
            setCreating(true);
            try {
                await createExpense({
                    description: data.description,
                    amount: data.amount,
                    date: data.date,
                });
                setShowForm(false);
                reset();
            } catch (err) {
                console.error('Failed to create expense:', err);
            } finally {
                setCreating(false);
            }
        }
    };

    const handleEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setValue('description', expense.description);
        setValue('amount', expense.amount);
        setValue('date', expense.date.split('T')[0]);
        setValue('categoryName', expense.category?.primary || '');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setShowForm(false);
        reset({
            description: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
        });
    };

    const handleDeleteClick = (expenseId: string) => {
        setConfirmDelete(expenseId);
    };

    const handleConfirmDelete = async (expenseId: string) => {
        setDeletingId(expenseId);
        try {
            await deleteExpense(expenseId);
            setConfirmDelete(null);
        } catch (err) {
            console.error('Failed to delete expense:', err);
        } finally {
            setDeletingId(null);
        }
    };

    // Poll for pending categorizations (every 5s)
    useEffect(() => {
        const hasPending = expenses.some((e) => !e.category);
        if (!hasPending) return;

        const intervalId = setInterval(() => {
            loadExpenses(meta.page);
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, [expenses, loadExpenses, meta.page]);

    return (
        <Layout title={t.dashboard.title}>
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="mb-6">
                <button
                    onClick={() => {
                        if (editingId) handleCancelEdit();
                        setShowForm(!showForm);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t.dashboard.addExpense}
                </button>
            </div>

            {showForm && (
                <div className="card mb-6 animate-slide-up">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingId ? t.modals.editTitle : t.dashboard.newExpense}
                    </h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.dashboard.description}
                            </label>
                            <input
                                {...register('description')}
                                type="text"
                                className="input-field"
                                placeholder={t.dashboard.descriptionPlaceholder}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{t.dashboard.descriptionError}</p>
                            )}
                        </div>

                        {editingId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoria (opcional)
                                </label>
                                <select
                                    {...register('categoryName')}
                                    className="input-field"
                                >
                                    <option value="">Manter categoria da IA</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name} {cat.isDefault ? '(padrão)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.dashboard.amount}
                                </label>
                                <input
                                    {...register('amount', { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="25.50"
                                />
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600">{t.dashboard.amountError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t.dashboard.date}
                                </label>
                                <input {...register('date')} type="date" className="input-field" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                                {creating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {editingId ? t.modals.updating : t.dashboard.creating}
                                    </>
                                ) : (
                                    <>{editingId ? t.actions.save : t.dashboard.createExpense}</>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="btn-secondary"
                            >
                                {t.dashboard.cancel}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                </div>
            )}

            {!loading && expenses.length === 0 && (
                <div className="card text-center py-12">
                    <p className="text-gray-500">{t.dashboard.noExpenses}</p>
                </div>
            )}

            {!loading && expenses.length > 0 && (
                <div className="space-y-3">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="card hover:shadow-md transition-shadow">
                            {confirmDelete === expense.id ? (
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <h4 className="font-semibold text-red-900 mb-2">{t.modals.deleteTitle}</h4>
                                    <p className="text-sm text-red-700 mb-4">{t.modals.deleteMessage}</p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleConfirmDelete(expense.id)}
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
                                            onClick={() => setConfirmDelete(null)}
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
                                                onClick={() => handleEdit(expense)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title={t.actions.edit}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(expense.id)}
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
                                                {new Date(expense.date).toLocaleDateString('pt-BR')} {new Date(expense.date).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="font-semibold text-gray-900 ml-auto">
                                                {formatCurrency(expense.amount, currency)}
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
            )}
        </Layout>
    );
};
