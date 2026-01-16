import { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode, translations, Translations } from '@domain/types/language.types';
import { userService } from '../services/user.service';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        const saved = localStorage.getItem('selected_language');
        return (saved as LanguageCode) || 'pt';
    });

    const setLanguage = async (newLanguage: LanguageCode) => {
        try {
            await userService.updateProfile({ language: newLanguage });

            setLanguageState(newLanguage);
            localStorage.setItem('selected_language', newLanguage);
        } catch (error) {
            console.error('Failed to update language:', error);
        }
    };

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
