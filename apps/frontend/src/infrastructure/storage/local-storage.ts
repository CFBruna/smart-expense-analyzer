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
}

export const localStorageService = new LocalStorageService();
