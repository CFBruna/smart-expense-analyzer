import { LanguageCode } from '@domain/types/language.types';

// Helper to translate category based on current language
export const translateCategory = (category: string, language: LanguageCode): string => {
    const translations: Record<LanguageCode, Record<string, string>> = {
        pt: {
            Other: 'Outros',
            Transportation: 'Transporte',
            Food: 'Alimentação',
            Healthcare: 'Saúde',
            Entertainment: 'Entretenimento',
            Shopping: 'Compras',
            Bills: 'Contas',
            Education: 'Educação',
        },
        en: {
            Other: 'Other',
            Transportation: 'Transportation',
            Food: 'Food',
            Healthcare: 'Healthcare',
            Entertainment: 'Entertainment',
            Shopping: 'Shopping',
            Bills: 'Bills',
            Education: 'Education',
        },
        es: {
            Other: 'Otros',
            Transportation: 'Transporte',
            Food: 'Comida',
            Healthcare: 'Salud',
            Entertainment: 'Entretenimiento',
            Shopping: 'Compras',
            Bills: 'Cuentas',
            Education: 'Educación',
        },
    };

    return translations[language][category] || category;
};
