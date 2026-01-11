import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CurrencyCode } from '@domain/types/currency.types';
import { userService } from '../services/user.service';

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        const saved = localStorage.getItem('selected_currency');
        return (saved as CurrencyCode) || 'BRL';
    });
    const [isLoading, setIsLoading] = useState(false);

    const setCurrency = async (newCurrency: CurrencyCode) => {
        setIsLoading(true);
        try {
            await userService.updateCurrency(newCurrency);
            setCurrencyState(newCurrency);
            localStorage.setItem('selected_currency', newCurrency);
        } catch (error) {
            console.error('Failed to update currency:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
    }, []);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
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
