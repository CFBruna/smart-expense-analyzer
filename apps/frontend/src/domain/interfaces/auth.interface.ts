export interface User {
    id: string;
    email: string;
    name: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    userId: string;
    email: string;
}
