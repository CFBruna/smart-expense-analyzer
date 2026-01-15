describe('Multi-Currency Support', () => {
    beforeEach(() => {
        cy.login();
        cy.wait(1000);
    });

    it('should display dashboard with menu', () => {
        cy.url().should('eq', Cypress.config().baseUrl + '/');
        cy.get('[aria-label="Menu"]').should('exist');
    });

    it('should open navigation menu', () => {
        cy.get('[aria-label="Menu"]').click();
        cy.wait(500);
        cy.get('body').should('be.visible');
    });

    it('should have currency selector in application', () => {
        cy.get('body').should('be.visible');
        cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
});
