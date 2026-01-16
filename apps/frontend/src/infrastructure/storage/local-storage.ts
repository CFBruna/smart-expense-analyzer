class LocalStorageService {
    setToken(token: string): void {
        localStorage.setItem('access_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    removeToken(): void {
        localStorage.removeItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    clearAll(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('selected_currency');
        localStorage.removeItem('selected_language');
    }
}

export const localStorageService = new LocalStorageService();
