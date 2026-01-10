import { useCurrency } from '@application/contexts/CurrencyContext';
import { CURRENCIES, CurrencyCode } from '@domain/types/currency.types';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const CurrencySelector = ({ minimal = false }: { minimal?: boolean }) => {
    const { currency, setCurrency } = useCurrency();
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

    const handleSelect = (code: CurrencyCode) => {
        setCurrency(code);
        setIsOpen(false);
    };

    const currentCurrency = CURRENCIES[currency];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[32px] sm:min-h-[40px] ${minimal ? 'justify-center' : ''}`}
            >
                <span className="text-base sm:text-lg leading-none">{currentCurrency.symbol}</span>
                {!minimal && <span className="hidden sm:inline leading-none">{currentCurrency.code}</span>}
                {!minimal && <ChevronDown size={14} className={`hidden sm:block transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    {Object.values(CURRENCIES).map((curr) => (
                        <button
                            key={curr.code}
                            onClick={() => handleSelect(curr.code)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 ${currency === curr.code ? 'bg-primary-50' : ''
                                }`}
                        >
                            <span className="text-xl w-8">{curr.symbol}</span>
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{curr.code}</div>
                                <div className="text-xs text-gray-600">{curr.name}</div>
                            </div>
                            {currency === curr.code && (
                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
