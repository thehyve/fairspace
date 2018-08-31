describe('e2e tests checking metadata for Fairspace', function () {
    before(() => {
        cy.login(Cypress.config("user_name"), Cypress.config("password"));
    })

    after(() => {
        cy.logout()
    })

    it('successfully see metadata about patient that is linked to a collection', function () {
        // Go to collections page
        cy.contains("Collections").click();

        // Wait for the list of collections to be loaded
        // and click on the GSE8581 study
        cy.contains("GSE8581").click();

        // Wait for the metadata to be loaded and expect the metadata of the patient to be there
        cy.contains("https://workspace.ci.test.fairdev.app/iri/patients/GSM210004");
    });


    it('successfully see metadata about patients', function () {
        // Go to a metadata page about a patient
        cy.visit("/metadata/patients/GSM210004");

        // Wait for the page to show 'Type:' (which indicates that metadata has been loaded
        cy.contains("Type:");

        // Expect the id and type to be shown on the page,
        cy.contains("Id: GSM210004");
        cy.get("a").contains("Person");
    });

});
