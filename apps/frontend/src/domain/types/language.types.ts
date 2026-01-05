export type LanguageCode = 'pt' | 'en' | 'es';

export interface Language {
    code: LanguageCode;
    name: string;
    flag: string;
}

export const LANGUAGES: Record<LanguageCode, Language> = {
    pt: {
        code: 'pt',
        name: 'Português',
        flag: '🇧🇷',
    },
    en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
    },
    es: {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸',
    },
};

export interface Translations {
    // Auth
    auth: {
        login: string;
        loginButton: string;
        loggingIn: string;
        email: string;
        password: string;
        invalidEmail: string;
        passwordRequired: string;
        invalidCredentials: string;
        useDemoAccount: string;
        demoLoaded: string;
    };

    // Navigation
    nav: {
        appName: string;
        tagline: string;
        dashboard: string;
        analytics: string;
        logout: string;
    };

    // Dashboard
    dashboard: {
        title: string;
        addExpense: string;
        newExpense: string;
        description: string;
        descriptionPlaceholder: string;
        descriptionError: string;
        amount: string;
        amountError: string;
        date: string;
        createExpense: string;
        creating: string;
        cancel: string;
        noExpenses: string;
        expenses: string;
        confidence: string;
    };

    // Analytics
    analytics: {
        title: string;
        allPeriods: string;
        lastWeek: string;
        lastMonth: string;
        lastYear: string;
        totalSpent: string;
        categories: string;
        spendingByCategory: string;
        categoryBreakdown: string;
        noData: string;
    };

    // Categories
    categories: {
        Other: string;
        Transportation: string;
        Food: string;
        Healthcare: string;
        Entertainment: string;
        Shopping: string;
        Bills: string;
        Education: string;
    };

    // Common
    common: {
        loading: string;
        error: string;
    };

    // Actions
    actions: {
        edit: string;
        delete: string;
        save: string;
        cancel: string;
        confirm: string;
    };

    // Modals
    modals: {
        deleteTitle: string;
        deleteMessage: string;
        editTitle: string;
        updating: string;
        deleting: string;
    };
}

export const translations: Record<LanguageCode, Translations> = {
    pt: {
        auth: {
            login: 'Entrar',
            loginButton: 'Entrar',
            loggingIn: 'Entrando...',
            email: 'E-mail',
            password: 'Senha',
            invalidEmail: 'Email inválido',
            passwordRequired: 'Senha é obrigatória',
            invalidCredentials: 'Credenciais inválidas. Tente novamente.',
            useDemoAccount: 'Usar conta demo',
            demoLoaded: '✓ Credenciais demo carregadas!',
        },
        nav: {
            appName: 'Smart Expense Analyzer',
            tagline: 'Gestão de despesas com IA',
            dashboard: 'Painel',
            analytics: 'Análises',
            logout: 'Sair',
        },
        dashboard: {
            title: 'Minhas Despesas',
            addExpense: 'Adicionar Despesa',
            newExpense: 'Nova Despesa',
            description: 'Descrição',
            descriptionPlaceholder: 'Uber para o dentista',
            descriptionError: 'Descrição deve ter pelo menos 3 caracteres',
            amount: 'Valor',
            amountError: 'Valor deve ser maior que 0',
            date: 'Data',
            createExpense: 'Criar Despesa',
            creating: 'Criando...',
            cancel: 'Cancelar',
            noExpenses: 'Nenhuma despesa ainda. Adicione sua primeira despesa acima!',
            expenses: 'despesas',
            confidence: 'confiança',
        },
        analytics: {
            title: 'Análises',
            allPeriods: 'Todos os Períodos',
            lastWeek: 'Última Semana',
            lastMonth: 'Último Mês',
            lastYear: 'Último Ano',
            totalSpent: 'Total Gasto',
            categories: 'Categorias',
            spendingByCategory: 'Gastos por Categoria',
            categoryBreakdown: 'Detalhamento por Categoria',
            noData: 'Nenhum dado disponível para o período selecionado.',
        },
        categories: {
            Other: 'Outros',
            Transportation: 'Transporte',
            Food: 'Alimentação',
            Healthcare: 'Saúde',
            Entertainment: 'Entretenimento',
            Shopping: 'Compras',
            Bills: 'Contas',
            Education: 'Educação',
        },
        common: {
            loading: 'Carregando...',
            error: 'Erro',
        },
        actions: {
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },
        modals: {
            deleteTitle: 'Confirmar Exclusão',
            deleteMessage: 'Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.',
            editTitle: 'Editar Despesa',
            updating: 'Atualizando...',
            deleting: 'Excluindo...',
        },
    },
    en: {
        auth: {
            login: 'Login',
            loginButton: 'Login',
            loggingIn: 'Logging in...',
            email: 'Email',
            password: 'Password',
            invalidEmail: 'Invalid email',
            passwordRequired: 'Password is required',
            invalidCredentials: 'Invalid credentials. Please try again.',
            useDemoAccount: 'Use demo account',
            demoLoaded: '✓ Demo credentials loaded!',
        },
        nav: {
            appName: 'Smart Expense Analyzer',
            tagline: 'AI-powered expense management',
            dashboard: 'Dashboard',
            analytics: 'Analytics',
            logout: 'Logout',
        },
        dashboard: {
            title: 'My Expenses',
            addExpense: 'Add Expense',
            newExpense: 'New Expense',
            description: 'Description',
            descriptionPlaceholder: 'Uber to dentist',
            descriptionError: 'Description must be at least 3 characters',
            amount: 'Amount',
            amountError: 'Amount must be greater than 0',
            date: 'Date',
            createExpense: 'Create Expense',
            creating: 'Creating...',
            cancel: 'Cancel',
            noExpenses: 'No expenses yet. Add your first expense above!',
            expenses: 'expenses',
            confidence: 'confidence',
        },
        analytics: {
            title: 'Analytics',
            allPeriods: 'All Periods',
            lastWeek: 'Last Week',
            lastMonth: 'Last Month',
            lastYear: 'Last Year',
            totalSpent: 'Total Spent',
            categories: 'Categories',
            spendingByCategory: 'Spending by Category',
            categoryBreakdown: 'Category Breakdown',
            noData: 'No data available for the selected period.',
        },
        categories: {
            Other: 'Other',
            Transportation: 'Transportation',
            Food: 'Food',
            Healthcare: 'Healthcare',
            Entertainment: 'Entertainment',
            Shopping: 'Shopping',
            Bills: 'Bills',
            Education: 'Education',
        },
        common: {
            loading: 'Loading...',
            error: 'Error',
        },
        actions: {
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            confirm: 'Confirm',
        },
        modals: {
            deleteTitle: 'Confirm Deletion',
            deleteMessage: 'Are you sure you want to delete this expense? This action cannot be undone.',
            editTitle: 'Edit Expense',
            updating: 'Updating...',
            deleting: 'Deleting...',
        },
    },
    es: {
        auth: {
            login: 'Iniciar sesión',
            loginButton: 'Entrar',
            loggingIn: 'Entrando...',
            email: 'Correo electrónico',
            password: 'Contraseña',
            invalidEmail: 'Correo inválido',
            passwordRequired: 'La contraseña es obligatoria',
            invalidCredentials: 'Credenciales inválidas. Intenta de nuevo.',
            useDemoAccount: 'Usar cuenta demo',
            demoLoaded: '✓ ¡Credenciales demo cargadas!',
        },
        nav: {
            appName: 'Smart Expense Analyzer',
            tagline: 'Gestión de gastos con IA',
            dashboard: 'Panel',
            analytics: 'Análisis',
            logout: 'Salir',
        },
        dashboard: {
            title: 'Mis Gastos',
            addExpense: 'Agregar Gasto',
            newExpense: 'Nuevo Gasto',
            description: 'Descripción',
            descriptionPlaceholder: 'Uber al dentista',
            descriptionError: 'La descripción debe tener al menos 3 caracteres',
            amount: 'Valor',
            amountError: 'El valor debe ser mayor que 0',
            date: 'Fecha',
            createExpense: 'Crear Gasto',
            creating: 'Creando...',
            cancel: 'Cancelar',
            noExpenses: '¡Todavía no hay gastos. Agrega tu primer gasto arriba!',
            expenses: 'gastos',
            confidence: 'confianza',
        },
        analytics: {
            title: 'Análisis',
            allPeriods: 'Todos los Períodos',
            lastWeek: 'Última Semana',
            lastMonth: 'Último Mes',
            lastYear: 'Último Año',
            totalSpent: 'Total Gastado',
            categories: 'Categorías',
            spendingByCategory: 'Gastos por Categoría',
            categoryBreakdown: 'Desglose por Categoría',
            noData: 'No hay datos disponibles para el período seleccionado.',
        },
        categories: {
            Other: 'Otros',
            Transportation: 'Transporte',
            Food: 'Comida',
            Healthcare: 'Salud',
            Entertainment: 'Entretenimiento',
            Shopping: 'Compras',
            Bills: 'Cuentas',
            Education: 'Educación',
        },
        common: {
            loading: 'Cargando...',
            error: 'Error',
        },
        actions: {
            edit: 'Editar',
            delete: 'Eliminar',
            save: 'Guardar',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
        },
        modals: {
            deleteTitle: 'Confirmar Eliminación',
            deleteMessage: '¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.',
            editTitle: 'Editar Gasto',
            updating: 'Actualizando...',
            deleting: 'Eliminando...',
        },
    },
};
