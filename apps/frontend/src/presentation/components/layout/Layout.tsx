import { Link } from 'react-router-dom';
import { useAuth } from '@application/hooks/useAuth';
import { LogOut, BarChart3, FolderKanban, Home } from 'lucide-react';
import { ReactNode } from 'react';
import { CurrencySelector } from '@presentation/components/common/CurrencySelector';
import { LanguageSelector } from '@presentation/components/common/LanguageSelector';
import { useLanguage } from '@application/contexts/LanguageContext';
import logo from '/src/image/logo.svg';

interface LayoutProps {
    children: ReactNode;
    title?: string;
}

export const Layout = ({ children }: LayoutProps) => {
    const { logout } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center gap-2 sm:gap-8">
                            <div className="flex items-center gap-2">
                                <img
                                    src={logo}
                                    alt="Smart Expense Analyzer Logo"
                                    className="h-8 w-8 md:h-10 md:w-10"
                                />
                                <h1 className="text-base sm:text-xl font-bold text-primary-600 whitespace-nowrap">
                                    {t.nav.appName}
                                </h1>
                            </div>
                            <div className="hidden sm:flex gap-4">
                                <Link
                                    to="/"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    {t.nav.dashboard}
                                </Link>
                                <Link
                                    to="/analytics"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    {t.nav.analytics}
                                </Link>
                                <Link
                                    to="/categories"
                                    className="text-gray-700 hover:text-primary-600 transition-colors"
                                >
                                    {t.nav.categories}
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <CurrencySelector />
                            <LanguageSelector />
                            <button
                                onClick={logout}
                                className="text-gray-700 hover:text-red-600 transition-colors p-1"
                                title={t.nav.logout}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-4 pb-20 md:pb-6">
                {children}
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    <Link
                        to="/"
                        className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary-600 active:text-primary-700 transition-colors"
                    >
                        <Home size={24} />
                        <span className="text-xs mt-1">{t.nav.dashboard}</span>
                    </Link>
                    <Link
                        to="/analytics"
                        className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary-600 active:text-primary-700 transition-colors"
                    >
                        <BarChart3 size={24} />
                        <span className="text-xs mt-1">{t.nav.analytics}</span>
                    </Link>
                    <Link
                        to="/categories"
                        className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary-600 active:text-primary-700 transition-colors"
                    >
                        <FolderKanban size={24} />
                        <span className="text-xs mt-1">{t.nav.categories}</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};
