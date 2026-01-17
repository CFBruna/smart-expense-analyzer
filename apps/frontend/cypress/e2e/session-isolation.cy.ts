describe('Session Isolation & Currency Persistence', () => {
    beforeEach(() => {
        cy.viewport('iphone-x');
    });

    it('should maintain distinct currency preferences between real and mocked users', () => {
        // Login as Demo User (BRL)
        cy.visit('/login');
        cy.contains(/Usar conta demo|Use demo account/i).click();
        cy.get('button[type="submit"]').click();

        cy.contains(/Adicionar|Add/i).should('be.visible', { timeout: 10000 });

        // Set BRL currency
        cy.get('body').click(0, 0);
        cy.get('[aria-label="Menu"]').click();
        cy.contains(/Moeda|Currency/i).parent().find('button').click();
        cy.contains('Real Brasileiro').click();
        cy.wait(1000);
        cy.get('body').click(0, 0);

        cy.get('body').should('contain', 'R$');

        // Logout
        cy.get('[aria-label="Menu"]').click();
        cy.contains(/Sair|Logout/i).click();
        cy.url().should('include', '/login');


        // Login as Mocked User (USD)
        cy.intercept('POST', '**/auth/login', {
            statusCode: 201,
            body: { access_token: 'mock_token_usd_user' }
        }).as('loginMock');

        cy.intercept('GET', '**/users/profile', {
            statusCode: 200,
            body: {
                id: 'user_usb',
                name: 'John Doe',
                email: 'john@test.com',
                currency: 'USD',
                language: 'en'
            }
        }).as('getProfileMock');

        cy.intercept('GET', '**/expenses?*', {
            body: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } }
        }).as('getExpensesMock');

        cy.intercept('GET', '**/expenses/counts/periods', {
            body: { today: 0, thisWeek: 0, thisMonth: 0, thisYear: 0, allTime: 0 }
        }).as('getCountsMock');

        cy.get('input[id="email"]').clear().type('john@test.com');
        cy.get('input[id="password"]').clear().type('password');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginMock');
        cy.wait('@getProfileMock');

        cy.contains(/Adicionar|Add/i).should('be.visible');

        cy.get('[aria-label="Menu"]').click();
        cy.contains(/Moeda|Currency/i).parent().should('contain', '$');
        cy.get('body').click(0, 0);

        // Logout
        cy.get('[aria-label="Menu"]').click();
        cy.contains(/Sair|Logout/i).click();
        cy.url().should('include', '/login');


        // Login as Demo User Again (verify BRL persistence)
        cy.intercept('POST', '**/auth/login', (req) => req.continue()).as('loginReal');
        cy.intercept('GET', '**/users/profile', (req) => req.continue()).as('getProfileReal');
        cy.intercept('GET', '**/expenses?*', (req) => req.continue()).as('getExpensesReal');
        cy.intercept('GET', '**/expenses/counts/periods', (req) => req.continue());

        cy.contains(/Usar conta demo|Use demo account/i).click();
        cy.get('button[type="submit"]').click();

        cy.wait('@loginReal');

        cy.contains(/Adicionar|Add/i).should('be.visible');
        cy.get('[aria-label="Menu"]').click();
        cy.contains(/Moeda|Currency/i).parent().should('contain', 'R$');
    });
});
