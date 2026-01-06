import { Link } from 'react-router-dom';
import { useAuth } from '@application/hooks/useAuth';
import { LogOut, BarChart3, FolderKanban, Home } from 'lucide-react';
import { ReactNode } from 'react';
import { CurrencySelector } from '@presentation/components/common/CurrencySelector';
import { LanguageSelector } from '@presentation/components/common/LanguageSelector';
import { useLanguage } from '@application/contexts/LanguageContext';

interface LayoutProps {
    children: ReactNode;
    title?: string;
}

export const Layout = ({ children }: LayoutProps) => {
    const { logout } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Header */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        {/* Logo & Nav Links */}
                        <div className="flex items-center gap-2 sm:gap-8">
                            <h1 className="text-base sm:text-xl font-bold text-primary-600 whitespace-nowrap">
                                {t.nav.appName}
                            </h1>
                            <div className="hidden sm:flex gap-4">
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
                                <Link
                                    to="/categories"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                                >
                                    <FolderKanban size={16} />
                                    Categorias
                                </Link>
                            </div>
                        </div>

                        {/* Right side controls */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <LanguageSelector />
                            <CurrencySelector />
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 sm:gap-2 text-gray-700 hover:text-red-600 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
                            >
                                <LogOut size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{t.nav.logout}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="flex justify-around items-center h-16">
                    <Link
                        to="/"
                        className="flex flex-col items-center justify-center flex-1 py-2 text-gray-600 hover:text-primary-600"
                    >
                        <Home size={20} />
                        <span className="text-xs mt-1">{t.nav.dashboard}</span>
                    </Link>
                    <Link
                        to="/analytics"
                        className="flex flex-col items-center justify-center flex-1 py-2 text-gray-600 hover:text-primary-600"
                    >
                        <BarChart3 size={20} />
                        <span className="text-xs mt-1">{t.nav.analytics}</span>
                    </Link>
                    <Link
                        to="/categories"
                        className="flex flex-col items-center justify-center flex-1 py-2 text-gray-600 hover:text-primary-600"
                    >
                        <FolderKanban size={20} />
                        <span className="text-xs mt-1">Categorias</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
                {children}
            </main>
        </div>
    );
};
