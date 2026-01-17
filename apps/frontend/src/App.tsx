import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@infrastructure/query-client';
import { LoginPage } from '@presentation/pages/LoginPage';
import { DashboardPage } from '@presentation/pages/DashboardPage';
import { AnalyticsPage } from '@presentation/pages/AnalyticsPage';
import { CategoriesPage } from '@presentation/pages/CategoriesPage';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { CurrencyProvider } from '@application/contexts/CurrencyContext';
import { LanguageProvider } from '@application/contexts/LanguageContext';
import { AuthProvider } from '@application/contexts/AuthContext';

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <LanguageProvider>
                    <CurrencyProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/analytics"
                                    element={
                                        <ProtectedRoute>
                                            <AnalyticsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/categories"
                                    element={
                                        <ProtectedRoute>
                                            <CategoriesPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </BrowserRouter>
                        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                    </CurrencyProvider>
                </LanguageProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
