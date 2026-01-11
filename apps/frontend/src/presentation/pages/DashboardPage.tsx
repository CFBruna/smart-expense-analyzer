import { useState, useEffect, useRef } from 'react';
import { useExpenses } from '@application/hooks/useExpenses';
import { Layout } from '@presentation/components/layout/Layout';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@application/contexts/LanguageContext';
import { Expense } from '@domain/interfaces/expense.interface';
import { ExpenseForm, ExpenseFormData } from '@presentation/components/dashboard/ExpenseForm';
import { ExpenseList } from '@presentation/components/dashboard/ExpenseList';
import { DashboardFilters } from '@presentation/components/dashboard/DashboardFilters';

export const DashboardPage = () => {
    const { expenses, loading, error, createExpense, updateExpense, deleteExpense, applyDateFilters, applySort, sortOrder } = useExpenses();
    const { t } = useLanguage();

    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const successMessageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (successMessage && successMessageRef.current) {
            successMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [successMessage]);

    const handleFilterApply = (startDate: string | undefined, endDate: string | undefined) => {
        if (!startDate || !endDate) {
            applyDateFilters(undefined);
        } else {
            applyDateFilters({ startDate, endDate });
        }
    };

    const handleFormSubmit = async (data: ExpenseFormData) => {
        setIsSubmitting(true);
        const isoDate = new Date(data.date).toISOString();

        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, {
                    description: data.description,
                    amount: data.amount,
                    date: isoDate,
                    manualCategory: data.categoryName ? {
                        primary: data.categoryName,
                        secondary: null,
                    } : undefined,
                });
                setSuccessMessage(t.dashboard.successUpdated);
            } else {
                await createExpense({
                    description: data.description,
                    amount: data.amount,
                    date: isoDate,
                    originalAmount: data.amount,
                    originalCurrency: data.currency,
                });
                setSuccessMessage(t.dashboard.successCreated);
            }

            setShowForm(false);
            setEditingExpense(null);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Failed to save expense:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditStart = (expense: Expense) => {
        setEditingExpense(expense);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingExpense(null);
    };

    const handleAddClick = () => {
        if (editingExpense) {
            handleCancelForm();
        }
        setShowForm((prev) => !prev);
    };

    return (
        <Layout title={t.dashboard.title}>
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div
                    ref={successMessageRef}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-slide-up"
                >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800">{successMessage}</p>
                </div>
            )}

            <DashboardFilters onApply={handleFilterApply} />

            <div className="mb-6 flex flex-row justify-between items-center gap-4">
                <button
                    onClick={handleAddClick}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    {t.actions.add}
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hidden sm:inline">
                        {t.dashboard.filters.sort}
                    </span>
                    <select
                        className="input-field py-2 px-3 pr-8 bg-white"
                        value={sortOrder}
                        onChange={(e) => applySort(e.target.value as 'asc' | 'desc')}
                    >
                        <option value="desc">
                            {t.dashboard.filters.newest}
                        </option>
                        <option value="asc">
                            {t.dashboard.filters.oldest}
                        </option>
                    </select>
                </div>
            </div>

            {showForm && (
                <ExpenseForm
                    initialData={editingExpense}
                    onSubmit={handleFormSubmit}
                    onCancel={handleCancelForm}
                    isLoading={isSubmitting}
                />
            )}

            <ExpenseList
                expenses={expenses}
                loading={loading && !isSubmitting && !showForm && expenses.length === 0} // Only show full loader on initial load
                onEdit={handleEditStart}
                onDelete={deleteExpense}
            />
        </Layout>
    );
};
