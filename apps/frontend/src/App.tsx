import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@presentation/pages/LoginPage';
import { DashboardPage } from '@presentation/pages/DashboardPage';
import { AnalyticsPage } from '@presentation/pages/AnalyticsPage';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { CurrencyProvider } from '@application/contexts/CurrencyContext';
import { LanguageProvider } from '@application/contexts/LanguageContext';

function App() {
    return (
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
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </CurrencyProvider>
        </LanguageProvider>
    );
}

export default App;
