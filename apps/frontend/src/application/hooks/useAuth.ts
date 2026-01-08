import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginDto } from '@domain/interfaces/auth.interface';
import { authService } from '../services/auth.service';
import { useLanguage } from '../contexts/LanguageContext';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const login = async (credentials: LoginDto): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await authService.login(credentials);
            navigate('/');
        } catch {
            setError(t.auth.invalidCredentials);
        } finally {
            setLoading(false);
        }
    };

    const logout = (): void => {
        authService.logout();
        navigate('/login');
    };

    const isAuthenticated = (): boolean => {
        return authService.isAuthenticated();
    };

    return { login, logout, isAuthenticated, loading, error };
};
