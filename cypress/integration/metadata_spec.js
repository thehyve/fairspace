describe('e2e tests checking metadata for Fairspace', function () {
    beforeEach(() => {
        cy.visit('');
        cy.url().should('include', '/auth/realms');
        cy.get('input[name=username]').type(Cypress.config("user_name"));
        cy.get('input[name=password').type(Cypress.config("password") + '{enter}');
    });

    it('successfully see metadata about patient that is linked to a collection', function () {
        cy.contains("Collections").click();
        cy.get('button').contains("add").click();

        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
            cy.get('button').contains("add").click();
        cy.wait(500);
        cy.get('tr').find('th').contains("GSE8581").click();
        cy.wait(1000);
        cy.get('a').contains("https://workspace.ci.test.fairdev.app/iri/patients/GSM210004");
    });
    });


    it('successfully see metadata about patients', function () {
        cy.visit("/metadata/patients/GSM210004")
            // Actual metadata is loaded asynchronously
            .then(() => cy.wait(500))
            .then(() => {
                cy.get("ul>li").contains("Id: GSM210004");
                cy.get("div>b")
                    .contains("Type:")
                    .parentsUntil("li")
                    .within(($metadataElement) => {
                        cy.contains("Person")
                    });
            });
    });

});
