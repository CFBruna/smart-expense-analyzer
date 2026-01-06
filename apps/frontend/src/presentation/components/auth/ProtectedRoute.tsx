import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@application/services/auth.service';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
