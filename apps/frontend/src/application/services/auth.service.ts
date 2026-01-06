import { LoginDto, AuthResponse } from '@domain/interfaces/auth.interface';
import { apiClient } from '@infrastructure/http/axios-client';
import { localStorageService } from '@infrastructure/storage/local-storage';

export class AuthService {
    async login(credentials: LoginDto): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        localStorageService.setToken(response.accessToken);
        return response;
    }

    logout(): void {
        localStorageService.removeToken();
    }

    isAuthenticated(): boolean {
        return localStorageService.isAuthenticated();
    }
}

export const authService = new AuthService();
