import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useCurrency } from '@application/contexts/CurrencyContext';
import { useCategories } from '@application/hooks/useCategories';
import { useLanguage } from '@application/contexts/LanguageContext';
import { translateCategory } from '@application/utils/translate-category';
import { CURRENCIES } from '@domain/types/currency.types';
import { Expense } from '@domain/interfaces/expense.interface';

const expenseSchema = z.object({
    description: z.string().min(2),
    amount: z.number().min(0.01),
    currency: z.string().length(3),
    date: z.string(),
    categoryName: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
    initialData?: Expense | null;
    onSubmit: (data: ExpenseFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ExpenseForm = ({ initialData, onSubmit, onCancel, isLoading = false }: ExpenseFormProps) => {
    const { currency } = useCurrency();
    const { categories } = useCategories();
    const { language, t } = useLanguage();

    const getFormattedDateInput = (date?: string | Date) => {
        const d = date ? new Date(date) : new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            date: getFormattedDateInput(),
            currency: currency,
            amount: 0,
            description: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            setValue('description', initialData.description);
            setValue('amount', initialData.originalAmount || initialData.amount);
            setValue('currency', initialData.originalCurrency || currency);
            setValue('date', getFormattedDateInput(initialData.date));
            setValue('categoryName', initialData.category?.primary || '');
        } else {
            reset({
                description: '',
                amount: 0,
                date: getFormattedDateInput(),
                currency: currency,
                categoryName: '',
            });
        }
    }, [initialData, currency, reset, setValue]);

    return (
        <div className="card mb-6 animate-slide-up">
            <h3 className="text-lg font-semibold mb-4">
                {initialData ? t.modals.editTitle : t.dashboard.newExpense}
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

                {initialData && (
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
                                    {translateCategory(cat.name, language)} {cat.isDefault ? '(padrão)' : ''}
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
                        <div className="flex gap-2">
                            <select
                                {...register('currency')}
                                className="input-field w-24 px-2"
                            >
                                {Object.values(CURRENCIES).map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.code}
                                    </option>
                                ))}
                            </select>
                            <input
                                {...register('amount', { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                className="input-field flex-1"
                                placeholder="25.50"
                            />
                        </div>
                        {errors.amount && (
                            <p className="mt-1 text-sm text-red-600">{t.dashboard.amountError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.dashboard.date}
                        </label>
                        <input {...register('date')} type="datetime-local" className="input-field" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {initialData ? t.modals.updating : t.dashboard.creating}
                            </>
                        ) : (
                            <>{initialData ? t.actions.save : t.dashboard.createExpense}</>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        {t.dashboard.cancel}
                    </button>
                </div>
            </form>
        </div>
    );
};
