import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@application/hooks/useAuth';
import { LogIn, AlertCircle } from 'lucide-react';
import { useLanguage } from '@application/contexts/LanguageContext';
import { LanguageSelector } from '@presentation/components/common/LanguageSelector';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { login, loading, error } = useAuth();
    const { t } = useLanguage();
    const [showDemo, setShowDemo] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        await login(data);
    };

    const fillDemoCredentials = () => {
        setValue('email', 'demo@expense.com');
        setValue('password', 'ExpenseDemo2026!');
        setShowDemo(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
            <div className="card max-w-md w-full animate-slide-up relative">
                {/* Language Selector */}
                <div className="absolute top-2 right-2 z-10">
                    <LanguageSelector />
                </div>
                <div className="text-center mb-8 pr-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Expense Analyzer</h1>
                    <p className="text-gray-600">{t.nav.tagline}</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.email}
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            id="email"
                            className="input-field"
                            placeholder="demo@expense.com"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{t.auth.invalidEmail}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            {t.auth.password}
                        </label>
                        <input
                            {...register('password')}
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{t.auth.passwordRequired}</p>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                        <LogIn size={20} />
                        {loading ? t.auth.loggingIn : t.auth.loginButton}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={fillDemoCredentials}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        {showDemo ? t.auth.demoLoaded : t.auth.useDemoAccount}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                        Email: demo@expense.com | Password: ExpenseDemo2026!
                    </p>
                </div>
            </div>
        </div>
    );
};
