import { Link } from 'react-router-dom';
import { useAuth } from '@application/hooks/useAuth';
import { LogOut, BarChart3 } from 'lucide-react';
import { ReactNode } from 'react';
import { CurrencySelector } from '@presentation/components/common/CurrencySelector';
import { LanguageSelector } from '@presentation/components/common/LanguageSelector';
import { useLanguage } from '@application/contexts/LanguageContext';

interface LayoutProps {
    children: ReactNode;
    title: string;
}

export const Layout = ({ children, title }: LayoutProps) => {
    const { logout } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-xl font-bold text-primary-600">{t.nav.appName}</h1>
                            <div className="flex gap-4">
                                <Link
                                    to="/"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    {t.nav.dashboard}
                                </Link>
                                <Link
                                    to="/analytics"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                                >
                                    <BarChart3 size={16} />
                                    {t.nav.analytics}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageSelector />
                            <CurrencySelector />
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                <LogOut size={16} />
                                {t.nav.logout}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                {children}
            </main>
        </div>
    );
};
