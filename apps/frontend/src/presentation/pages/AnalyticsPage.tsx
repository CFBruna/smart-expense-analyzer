import { useState } from 'react';
import { useAnalytics } from '@application/hooks/useAnalytics';
import { Layout } from '@presentation/components/layout/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useCurrency } from '@application/contexts/CurrencyContext';
import { formatCurrency } from '@domain/types/currency.types';
import { useLanguage } from '@application/contexts/LanguageContext';
import { translateCategory } from '@application/utils/translate-category';


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

type Period = 'week' | 'month' | 'year' | undefined;

export const AnalyticsPage = () => {
    const [period, setPeriod] = useState<Period>(undefined);
    const { data, loading, error } = useAnalytics(period);
    const { currency } = useCurrency();
    const { language, t } = useLanguage();

    const chartData = data?.categoryBreakdown.map((item, index) => ({
        name: translateCategory(item.category, language),
        value: item.total,
        count: item.count,
        percentage: item.percentage,
        fill: COLORS[index % COLORS.length],
    }));

    return (
        <Layout title={t.analytics.title}>
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setPeriod(undefined)}
                    className={`px-4 py-2 rounded-lg transition-colors ${period === undefined
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {t.analytics.allPeriods}
                </button>
                <button
                    onClick={() => setPeriod('week')}
                    className={`px-4 py-2 rounded-lg transition-colors ${period === 'week'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {t.analytics.lastWeek}
                </button>
                <button
                    onClick={() => setPeriod('month')}
                    className={`px-4 py-2 rounded-lg transition-colors ${period === 'month'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {t.analytics.lastMonth}
                </button>
                <button
                    onClick={() => setPeriod('year')}
                    className={`px-4 py-2 rounded-lg transition-colors ${period === 'year'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {t.analytics.lastYear}
                </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {translateCategory(item.category, language)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{item.count} {t.dashboard.expenses}</p>
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
