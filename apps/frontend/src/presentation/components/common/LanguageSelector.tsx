import { useLanguage } from '@application/contexts/LanguageContext';
import { LANGUAGES, LanguageCode } from '@domain/types/language.types';
import { useState, useRef, useEffect } from 'react';

export const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: LanguageCode) => {
        setLanguage(code);
        setIsOpen(false);
    };

    const currentLanguage = LANGUAGES[language];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                title="Idioma / Language / Idioma"
            >
                <span className="text-base sm:text-lg">{currentLanguage.flag}</span>
                <span className="hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {Object.values(LANGUAGES).map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 ${language === lang.code ? 'bg-primary-50' : ''
                                }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{lang.name}</div>
                            </div>
                            {language === lang.code && (
                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
