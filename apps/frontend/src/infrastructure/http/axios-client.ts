import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = localStorage.getItem('access_token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T>(url: string, params?: object): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    async post<T>(url: string, data?: object): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: object): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }
}

export const apiClient = new ApiClient();
