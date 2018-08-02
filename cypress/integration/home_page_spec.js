describe('e2e tests for Fairspace', function () {
    beforeEach(() => {
        cy.visit('');
        cy.url().should('include', '/auth/realms');
        cy.get('input[name=username]').type(Cypress.config("user_name"));
        cy.get('input[name=password').type(Cypress.config("password") + '{enter}');
    });

    it('successfully log in', function () {
        cy.url().should('include', 'https://workspace.ci.test.fairdev.app/');
        cy.getCookie('JSESSIONID').should('exist');
    });

    it('successfully see list of collections', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('h3');
                cy.get('ul').find('li').should('length.above', 0);
        });
    });

    it('successfully add collection', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                let number = 0;
                cy.get('ul>li').each(() => {
                    number += 1;
                   return number;
                }).then(() => {
                    cy.get('button').contains("add").click();
                    cy.get('ul>li').should('length.above', number);
                })
            });
    });

    it('successfully change name of collection', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('h3');
                cy.get('ul').find('li').contains("Test workspace-ci's collection").click();
                cy.get('h2').contains("Test workspace-ci's collection").click();
                cy.get('input[name=name]').clear().type('test change name');
                cy.get('button').contains('Save').click();
                cy.get('ul>li').should('contain', 'test change name');
            });
    });
});
