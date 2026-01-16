import { apiClient } from '../../infrastructure/http/axios-client';
import { CurrencyCode } from '@domain/types/currency.types';

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    currency: CurrencyCode;
    language: string;
    createdAt: string;
}

export interface UpdateProfileData {
    name?: string;
    currency?: CurrencyCode;
    language?: string;
}

export const userService = {
    getProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get<UserProfile>('/users/profile');
        return response;
    },

    updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
        const response = await apiClient.patch<UserProfile>('/users/profile', data);
        return {
            id: response.id,
            email: response.email,
            name: response.name,
            currency: response.currency,
            language: response.language,
            createdAt: response.createdAt,
        };
    },

    updateCurrency: async (currency: CurrencyCode): Promise<void> => {
        await apiClient.patch('/users/profile/currency', { currency });
    },
};
