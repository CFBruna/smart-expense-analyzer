import { apiClient } from '../../infrastructure/http/axios-client';
import { CurrencyCode } from '@domain/types/currency.types';

export const userService = {
    updateCurrency: async (currency: CurrencyCode): Promise<void> => {
        await apiClient.patch('/users/profile/currency', { currency });
    },
};
