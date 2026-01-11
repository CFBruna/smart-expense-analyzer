export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'PYG' | 'ARS' | 'GBP' | 'JPY' | 'CLP' | 'UYU';

export interface Currency {
    code: CurrencyCode;
    symbol: string;
    name: string;
    locale: string;
    decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
    BRL: {
        code: 'BRL',
        symbol: 'R$',
        name: 'Real Brasileiro',
        locale: 'pt-BR',
        decimals: 2,
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'Dólar Americano',
        locale: 'en-US',
        decimals: 2,
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        locale: 'de-DE',
        decimals: 2,
    },
    PYG: {
        code: 'PYG',
        symbol: '₲',
        name: 'Guarani Paraguaio',
        locale: 'es-PY',
        decimals: 0,
    },
    ARS: {
        code: 'ARS',
        symbol: '$',
        name: 'Peso Argentino',
        locale: 'es-AR',
        decimals: 2,
    },
    GBP: {
        code: 'GBP',
        symbol: '£',
        name: 'Libra Esterlina',
        locale: 'en-GB',
        decimals: 2,
    },
    JPY: {
        code: 'JPY',
        symbol: '¥',
        name: 'Iene Japonês',
        locale: 'ja-JP',
        decimals: 0,
    },
    CLP: {
        code: 'CLP',
        symbol: '$',
        name: 'Peso Chileno',
        locale: 'es-CL',
        decimals: 0,
    },
    UYU: {
        code: 'UYU',
        symbol: '$',
        name: 'Peso Uruguaio',
        locale: 'es-UY',
        decimals: 2,
    },
};

export const formatCurrency = (amount: number, currencyCode: CurrencyCode): string => {
    const currency = CURRENCIES[currencyCode];

    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
    }).format(amount);
};
