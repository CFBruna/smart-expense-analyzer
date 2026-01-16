import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LoginDto } from '@domain/interfaces/auth.interface';
import { authService } from '../services/auth.service';
import { localStorageService } from '../../infrastructure/storage/local-storage';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { setUserToken } = useAuthContext();

    const login = async (credentials: LoginDto): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await authService.login(credentials);
            setUserToken(localStorageService.getToken());
            navigate('/');
        } catch {
            setError(t.auth.invalidCredentials);
        } finally {
            setLoading(false);
        }
    };

    const logout = (): void => {
        queryClient.clear();

        localStorageService.clearAll();
        setUserToken(null);

        authService.logout();

        navigate('/login');
    };

    const isAuthenticated = (): boolean => {
        return authService.isAuthenticated();
    };

    return { login, logout, isAuthenticated, loading, error };
};
