import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CurrencyCode } from '@domain/types/currency.types';
import { userService } from '../services/user.service';
import { useAuthContext } from './AuthContext';

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    isLoading: boolean;
    isLoadingInitial: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const queryClient = useQueryClient();
    const { userToken } = useAuthContext();

    const [currency, setCurrencyState] = useState<CurrencyCode>('BRL');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    const setCurrency = async (newCurrency: CurrencyCode) => {
        setIsLoading(true);
        try {
            await userService.updateProfile({ currency: newCurrency });

            setCurrencyState(newCurrency);
            localStorage.setItem('selected_currency', newCurrency);

            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        } catch (error) {
            console.error('Failed to update currency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadUserPreference = async () => {
            if (userToken) {
                setIsLoadingInitial(true);
                try {
                    const profile = await userService.getProfile();

                    const backendCurrency = (profile.currency as CurrencyCode) || 'BRL';
                    setCurrencyState(backendCurrency);
                    localStorage.setItem('selected_currency', backendCurrency);

                    queryClient.invalidateQueries({ queryKey: ['expenses'] });
                    queryClient.invalidateQueries({ queryKey: ['analytics'] });
                } catch (error) {
                    console.error('Failed to load user currency preference:', error);
                    setCurrencyState('BRL');
                } finally {
                    setIsLoadingInitial(false);
                }
            } else {
                const saved = localStorage.getItem('selected_currency') as CurrencyCode;
                setCurrencyState(saved || 'BRL');
                setIsLoadingInitial(false);
            }
        };

        loadUserPreference();
    }, [userToken, queryClient]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, isLoading, isLoadingInitial }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within CurrencyProvider');
    }
    return context;
};
