import { Link } from 'react-router-dom';
import { useAuth } from '@application/hooks/useAuth';
import { LogOut, BarChart3, FolderKanban, Home, Menu, X } from 'lucide-react';
import { ReactNode, useState, useEffect, useRef } from 'react';
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
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center gap-2 sm:gap-8">
                            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <img
                                    src={logo}
                                    alt="Smart Expense Analyzer Logo"
                                    className="h-8 w-8 md:h-10 md:w-10"
                                />
                                <h1 className="text-base sm:text-xl font-bold text-primary-600 whitespace-nowrap">
                                    {t.nav.appName}
                                </h1>
                            </Link>
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

                        {/* Hamburger menu button */}
                        <div>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-100"
                                aria-label="Menu"
                            >
                                {menuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Dropdown menu */}
                    {menuOpen && (
                        <div ref={menuRef} className="absolute right-2 top-14 sm:top-16 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50 py-2 space-y-1 animate-slide-up">
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors rounded-lg mx-2">
                                <span className="text-sm font-medium text-gray-700">{t.nav.currency}</span>
                                <CurrencySelector minimal />
                            </div>
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors rounded-lg mx-2">
                                <span className="text-sm font-medium text-gray-700">{t.nav.language}</span>
                                <LanguageSelector />
                            </div>
                            <div className="h-px bg-gray-100 my-2 mx-2"></div>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-2 w-[calc(100%-16px)] mx-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="text-sm font-medium">{t.nav.logout}</span>
                            </button>
                        </div>
                    )}
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

