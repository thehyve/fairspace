describe('Metadata in fairspace', function () {
    before(() => {
        cy.login(Cypress.config("user_name"), Cypress.config("password"));
        cy.ensureMetadataPresent();
    })

    after(() => {
        cy.logout()
    })

    it('should show metadata about a person', function () {
        // Go to a metadata page about a patient
        cy.visit("/metadata/persons/E2E-TEST");

        // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
        cy.get("main").contains("Metadata");

        // Expect the id to be shown on the page,
        cy.contains("Id: E2E-TEST");

        // Expect at least a name field with the correct value
        cy.contains("Name")
            .should('have.attr', 'id')
            .then(id =>
                cy.get('[aria-labelledby="' + id + '"]')
                    .find('input')
                    .should('have.value', 'Person 1')
            );
    });

    it('should link between entities', function () {
        // Go to a metadata page about a patient
        cy.visit("/metadata/persons/E2E-TEST");

        // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
        cy.get("main").contains("Metadata");

        // Expect at least a name field with the correct value
        cy.contains("Provides material")
            .parent("li")
            .find("a").first()
            .contains("E2E-TEST-material")
            .should('have.attr', 'href', Cypress.config("baseUrl") + '/metadata/samples/E2E-TEST-material')
    });
});
