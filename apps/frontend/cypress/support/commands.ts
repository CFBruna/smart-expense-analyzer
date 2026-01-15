Cypress.Commands.add('login', () => {
    cy.visit('/');
    cy.contains('Smart Expense Analyzer').should('be.visible');

    cy.contains(/Usar conta demo|Use demo account/).click();
    cy.get('input[id="email"]').should('have.value', 'demo@expense.com');
    cy.get('input[id="password"]').should('have.value', 'ExpenseDemo2026!');

    cy.get('button[type="submit"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/', { timeout: 10000 });
    cy.contains(/Adicionar|Add/).should('be.visible', { timeout: 10000 });
});
