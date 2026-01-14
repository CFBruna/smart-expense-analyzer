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
        categories: string;
        logout: string;
        currency: string;
        language: string;
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
        expense: string;
        expenses: string;
        confidence: string;
        filters: {
            today: string;
            thisWeek: string;
            thisMonth: string;
            thisYear: string;
            allTime: string;
            customRange: string;
            from: string;
            to: string;
            apply: string;
            sort: string;
            newest: string;
            oldest: string;
        };
        successCreated: string;
        successUpdated: string;
        successDeleted: string;
        currency: string;
        originalValue: string;
        convertedFrom: string;
        exchangeRate: string;
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
        totalExpenses: string;
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

    // Categories Page
    categoriesPage: {
        title: string;
        subtitle: string;
        newCategory: string;
        editCategory: string;
        categoryName: string;
        categoryNamePlaceholder: string;
        color: string;
        icon: string;
        createCategory: string;
        updateCategory: string;
        defaultCategory: string;
        noCategories: string;
        edit: string;
        delete: string;
        confirm: string;
        cancel: string;
        successCreated: string;
        successUpdated: string;
        successDeleted: string;
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
        add: string;
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
            categories: 'Categorias',
            logout: 'Sair',
            currency: 'Moeda',
            language: 'Idioma',
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
            expense: 'despesa',
            expenses: 'despesas',
            confidence: 'confiança',
            filters: {
                today: 'Hoje',
                thisWeek: 'Esta Semana',
                thisMonth: 'Este Mês',
                thisYear: 'Este Ano',
                allTime: 'Todos',
                customRange: 'Período Personalizado',
                from: 'De',
                to: 'Até',
                apply: 'Aplicar',
                sort: 'Ordenar:',
                newest: 'Mais Recentes',
                oldest: 'Mais Antigos',
            },
            successCreated: 'Despesa criada com sucesso!',
            successUpdated: 'Despesa atualizada com sucesso!',
            successDeleted: 'Despesa excluída com sucesso!',
            currency: 'Moeda',
            originalValue: 'Valor original',
            convertedFrom: 'Convertido de',
            exchangeRate: 'Taxa de câmbio',
        },
        analytics: {
            title: 'Análises',
            allPeriods: 'Todos os Períodos',
            lastWeek: 'Última Semana',
            lastMonth: 'Último Mês',
            lastYear: 'Último Ano',
            totalSpent: 'Total Gasto',
            categories: 'Categorias',
            totalExpenses: 'Total de Despesas',
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
        categoriesPage: {
            title: 'Minhas Categorias',
            subtitle: 'Gerencie suas categorias personalizadas',
            newCategory: 'Nova Categoria',
            editCategory: 'Editar Categoria',
            categoryName: 'Nome da Categoria',
            categoryNamePlaceholder: 'Ex: Supermercado',
            color: 'Cor',
            icon: 'Ícone',
            createCategory: 'Criar Categoria',
            updateCategory: 'Atualizar Categoria',
            defaultCategory: 'Categoria padrão',
            noCategories: 'Nenhuma categoria cadastrada ainda. Clique em "Nova Categoria" para começar.',
            edit: 'Editar',
            delete: 'Deletar',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
            successCreated: 'Categoria criada com sucesso!',
            successUpdated: 'Categoria atualizada com sucesso!',
            successDeleted: 'Categoria excluída com sucesso!',
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
            add: 'Adicionar',
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
            categories: 'Categories',
            logout: 'Logout',
            currency: 'Currency',
            language: 'Language',
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
            expense: 'expense',
            expenses: 'expenses',
            confidence: 'confidence',
            filters: {
                today: 'Today',
                thisWeek: 'This Week',
                thisMonth: 'This Month',
                thisYear: 'This Year',
                allTime: 'All Time',
                customRange: 'Custom Range',
                from: 'From',
                to: 'To',
                apply: 'Apply',
                sort: 'Sort:',
                newest: 'Newest First',
                oldest: 'Oldest First',
            },
            successCreated: 'Expense created successfully!',
            successUpdated: 'Expense updated successfully!',
            successDeleted: 'Expense deleted successfully!',
            currency: 'Currency',
            originalValue: 'Original value',
            convertedFrom: 'Converted from',
            exchangeRate: 'Exchange rate',
        },
        analytics: {
            title: 'Analytics',
            allPeriods: 'All Periods',
            lastWeek: 'Last Week',
            lastMonth: 'Last Month',
            lastYear: 'Last Year',
            totalSpent: 'Total Spent',
            categories: 'Categories',
            totalExpenses: 'Total Expenses',
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
        categoriesPage: {
            title: 'My Categories',
            subtitle: 'Manage your custom categories',
            newCategory: 'New Category',
            editCategory: 'Edit Category',
            categoryName: 'Category Name',
            categoryNamePlaceholder: 'e.g., Groceries',
            color: 'Color',
            icon: 'Icon',
            createCategory: 'Create Category',
            updateCategory: 'Update Category',
            defaultCategory: 'Default category',
            noCategories: 'No categories yet. Click "New Category" to get started.',
            edit: 'Edit',
            delete: 'Delete',
            confirm: 'Confirm',
            cancel: 'Cancel',
            successCreated: 'Category created successfully!',
            successUpdated: 'Category updated successfully!',
            successDeleted: 'Category deleted successfully!',
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
            add: 'Add',
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
            categories: 'Categorías',
            logout: 'Salir',
            currency: 'Moneda',
            language: 'Idioma',
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
            expense: 'gasto',
            expenses: 'gastos',
            confidence: 'confianza',
            filters: {
                today: 'Hoy',
                thisWeek: 'Esta Semana',
                thisMonth: 'Este Mes',
                thisYear: 'Este Año',
                allTime: 'Todo',
                customRange: 'Rango Personalizado',
                from: 'Desde',
                to: 'Hasta',
                apply: 'Aplicar',
                sort: 'Ordenar:',
                newest: 'Más Recientes',
                oldest: 'Más Antiguos',
            },
            successCreated: '¡Gasto creado con éxito!',
            successUpdated: '¡Gasto actualizado con éxito!',
            successDeleted: '¡Gasto eliminado con éxito!',
            currency: 'Moneda',
            originalValue: 'Valor original',
            convertedFrom: 'Convertido de',
            exchangeRate: 'Tipo de cambio',
        },
        analytics: {
            title: 'Análisis',
            allPeriods: 'Todos los Períodos',
            lastWeek: 'Última Semana',
            lastMonth: 'Último Mes',
            lastYear: 'Último Año',
            totalSpent: 'Total Gastado',
            categories: 'Categorías',
            totalExpenses: 'Total de Gastos',
            spendingByCategory: 'Gastos por Categoría',
            categoryBreakdown: 'Desglose por Categorías',
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
        categoriesPage: {
            title: 'Mis Categorías',
            subtitle: 'Administra tus categorías personalizadas',
            newCategory: 'Nueva Categoría',
            editCategory: 'Editar Categoría',
            categoryName: 'Nombre de la Categoría',
            categoryNamePlaceholder: 'Ej: Supermercado',
            color: 'Color',
            icon: 'Ícono',
            createCategory: 'Crear Categoría',
            updateCategory: 'Actualizar Categoría',
            defaultCategory: 'Categoría predeterminada',
            noCategories: 'Aún no hay categorías. Haz clic en "Nueva Categoría" para comenzar.',
            edit: 'Editar',
            delete: 'Eliminar',
            confirm: 'Confirmar',
            cancel: 'Cancelar',
            successCreated: '¡Categoría creada con éxito!',
            successUpdated: '¡Categoría actualizada con éxito!',
            successDeleted: '¡Categoría eliminada con éxito!',
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
            add: 'Añadir',
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
