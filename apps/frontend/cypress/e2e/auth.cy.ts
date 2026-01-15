describe('Authentication Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display login page', () => {
        cy.contains('Smart Expense Analyzer').should('be.visible');
        cy.get('input[id="email"]').should('be.visible');
        cy.get('input[id="password"]').should('be.visible');
        cy.contains(/Entrar|Login/).should('be.visible');
    });

    it('should load demo credentials', () => {
        cy.contains(/Usar conta demo|Use demo account/).click();
        cy.get('input[id="email"]').should('have.value', 'demo@expense.com');
        cy.get('input[id="password"]').should('have.value', 'ExpenseDemo2026!');
    });

    it('should successfully login with demo credentials', () => {
        cy.login();
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.contains(/Adicionar|Add/).should('be.visible');
        cy.get('[aria-label="Menu"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
        cy.get('button[type="submit"]').click();
        cy.contains(/Email inválido|Invalid email/).should('be.visible');
        cy.contains(/Senha é obrigatória|Password is required/).should('be.visible');
    });

    it('should logout successfully', () => {
        cy.login();
        cy.get('[aria-label="Menu"]').click();
        cy.contains(/Sair|Logout/).click();
        cy.contains('Smart Expense Analyzer').should('be.visible');
        cy.get('input[id="email"]').should('be.visible');
    });
});
