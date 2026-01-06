import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginDto } from '@domain/interfaces/auth.interface';
import { authService } from '../services/auth.service';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (credentials: LoginDto): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            await authService.login(credentials);
            navigate('/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
            setError(message);
            throw err;
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
