import { useState } from 'react';
import { useAnalytics } from '@application/hooks/useAnalytics';
import { useCategories } from '@application/hooks/useCategories';
import { Layout } from '@presentation/components/layout/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, TrendingUp, Loader2, AlertCircle, Filter, Receipt } from 'lucide-react';
import { useCurrency } from '@application/contexts/CurrencyContext';
import { formatCurrency } from '@domain/types/currency.types';
import { useLanguage } from '@application/contexts/LanguageContext';
import { translateCategory } from '@application/utils/translate-category';
import { formatExpenseCount } from '@application/utils/format-expense-count';


const COLORS = [
    '#0ea5e9', // primary-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
];

type FilterPreset = 'today' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'allTime' | 'custom';

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

export const AnalyticsPage = () => {
    const { data, loading, error, applyDateFilters } = useAnalytics();
    const { categories } = useCategories();
    const { currency } = useCurrency();
    const { language, t } = useLanguage();
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
            applyDateFilters(Object.keys(range).length > 0 ? range : undefined);
        }
    };

    const handleCustomRangeApply = () => {
        if (customStartDate && customEndDate) {
            applyDateFilters({
                startDate: new Date(customStartDate).toISOString(),
                endDate: new Date(customEndDate + 'T23:59:59').toISOString(),
            });
        }
    };

    const categoryColorMap = new Map(
        categories.map(cat => [cat.name, cat.color])
    );

    const chartData = data?.categoryBreakdown.map((item, index) => ({
        name: translateCategory(item.category, language),
        value: item.total,
        count: item.count,
        percentage: item.percentage,
        fill: categoryColorMap.get(item.category) || COLORS[index % COLORS.length],
    }));

    return (
        <Layout title={t.analytics.title}>
            {/* Date Filters */}
            <div className="mb-6 card-filter">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-primary-600" />
                    <span className="font-medium text-gray-700">{t.dashboard.filters.customRange}</span>
                </div>
                <div className="filter-scroll-container mb-4">
                    {(['today', 'thisWeek', 'thisMonth', 'thisYear', 'allTime'] as const).map((preset) => (
                        <button
                            key={preset}
                            onClick={() => handleFilterChange(preset)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterPreset === preset
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {t.dashboard.filters[preset]}
                        </button>
                    ))}
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

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                </div>
            )}

            {!loading && data && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="card">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-primary-100 rounded-lg">
                                    <Wallet className="text-primary-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t.analytics.totalSpent}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(data.totalSpent, currency)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t.analytics.categories}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {data.categoryBreakdown.length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Receipt className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">{t.analytics.totalExpenses}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {data.categoryBreakdown.reduce((sum, item) => sum + item.count, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {chartData && chartData.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">{t.analytics.spendingByCategory}</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry.percentage.toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="card">
                                <h3 className="text-lg font-semibold mb-4">{t.analytics.categoryBreakdown}</h3>
                                <div className="space-y-3">
                                    {data.categoryBreakdown.map((item, index) => (
                                        <div key={item.category} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: categoryColorMap.get(item.category) || COLORS[index % COLORS.length] }}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {translateCategory(item.category, language)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{formatExpenseCount(item.count, t)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(item.total, currency)}
                                                </p>
                                                <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">
                                {t.analytics.noData}
                            </p>
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
};
