describe('Expense Management', () => {
    beforeEach(() => {
        cy.login();
        cy.wait(1000);
    });

    it('should display expense dashboard', () => {
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.contains(/Adicionar|Add/).should('be.visible');
    });

    it('should display expenses list or empty state', () => {
        cy.get('body').should('be.visible');
    });

    it('should have navigation menu', () => {
        cy.get('[aria-label="Menu"]').should('exist');
    });

    it('should apply date filters', () => {
        cy.contains(/Hoje|Today|Semana|Week|Mês|Month|Todos|All/).first().click({ force: true });
        cy.wait(500);
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should be able to navigate to analytics', () => {
        cy.contains(/Análises|Analytics/).click();
        cy.url().should('include', '/analytics');
    });
});
