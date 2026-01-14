import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useLanguage } from '@application/contexts/LanguageContext';
import { Expense } from '@domain/interfaces/expense.interface';

export type FilterPreset = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'allTime' | 'custom';

interface DashboardFiltersProps {
    onApply: (startDate: string | undefined, endDate: string | undefined) => void;
    expenses: Expense[];
}

const getDateRange = (preset: FilterPreset): { startDate?: string; endDate?: string } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
        case 'today':
            return { startDate: today.toISOString(), endDate: new Date(today.getTime() + 86400000 - 1).toISOString() };
        case 'thisWeek': {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return { startDate: weekStart.toISOString(), endDate: now.toISOString() };
        }
        case 'thisMonth': {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return { startDate: monthStart.toISOString(), endDate: now.toISOString() };
        }
        case 'thisYear': {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            return { startDate: yearStart.toISOString(), endDate: now.toISOString() };
        }
        case 'allTime':
        default:
            return {};
    }
};

const getFilterCount = (expenses: Expense[], preset: FilterPreset): number => {
    const range = getDateRange(preset);
    if (!range.startDate && !range.endDate) {
        return expenses.length;
    }

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const start = range.startDate ? new Date(range.startDate) : null;
        const end = range.endDate ? new Date(range.endDate) : null;

        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
    }).length;
};

export const DashboardFilters = ({ onApply, expenses }: DashboardFiltersProps) => {
    const { t } = useLanguage();
    const [filterPreset, setFilterPreset] = useState<FilterPreset>('allTime');
    const [showCustomRange, setShowCustomRange] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const handleFilterChange = (preset: FilterPreset) => {
        setFilterPreset(preset);
        if (preset === 'custom') {
            setShowCustomRange(true);
        } else {
            setShowCustomRange(false);
            const range = getDateRange(preset);
            onApply(range.startDate, range.endDate);
        }
    };

    const handleCustomRangeApply = () => {
        if (customStartDate && customEndDate) {
            onApply(
                new Date(customStartDate).toISOString(),
                new Date(customEndDate + 'T23:59:59').toISOString(),
            );
        }
    };

    return (
        <div className="mb-6 card-filter">
            <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-primary-600" />
                <span className="font-medium text-gray-700">{t.dashboard.filters.customRange}</span>
            </div>
            <div className="filter-scroll-container mb-4">
                {(['today', 'thisWeek', 'thisMonth', 'thisYear', 'allTime'] as const).map((preset) => {
                    const count = getFilterCount(expenses, preset);
                    return (
                        <button
                            key={preset}
                            onClick={() => handleFilterChange(preset)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterPreset === preset
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {t.dashboard.filters[preset]}
                            {count > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${filterPreset === preset
                                    ? 'bg-white bg-opacity-20 text-white'
                                    : 'bg-primary-100 text-primary-700'
                                    }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
                <button
                    onClick={() => handleFilterChange('custom')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterPreset === 'custom'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {t.dashboard.filters.customRange}
                </button>
            </div>

            {showCustomRange && (
                <div className="flex flex-wrap items-end gap-4 animate-slide-up">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.dashboard.filters.from}
                        </label>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t.dashboard.filters.to}
                        </label>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <button
                        onClick={handleCustomRangeApply}
                        disabled={!customStartDate || !customEndDate}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t.dashboard.filters.apply}
                    </button>
                </div>
            )}
        </div>
    );
};
