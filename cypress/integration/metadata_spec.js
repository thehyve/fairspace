describe('e2e tests checking metadata for Fairspace', function () {
    beforeEach(() => {
        cy.visit('');
        cy.url().should('include', '/auth/realms');
        cy.get('input[name=username]').type(Cypress.config("user_name"));
        cy.get('input[name=password').type(Cypress.config("password") + '{enter}');
    });

    it('successfully see metadata about patient that is linked to a collection', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('button').contains("add").click();
                cy.wait(500);
                cy.get('tr').find('th').contains("GSE8581").click();
                cy.wait(1000);
                cy.get('a').contains("https://workspace.ci.test.fairdev.app/iri/patients/GSM210004").click({force: true});
                cy.get("ul>li").contains("Type: patients");
                cy.get("ul>li").contains("Id: GSM210004");
            });
    });

});
