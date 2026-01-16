import { createContext, useContext, useState, ReactNode } from 'react';
import { localStorageService } from '../../infrastructure/storage/local-storage';

interface AuthContextType {
    userToken: string | null;
    setUserToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userToken, setUserToken] = useState<string | null>(() => {
        return localStorageService.getToken();
    });

    return (
        <AuthContext.Provider value={{ userToken, setUserToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};
