describe('Metadata Catalog', function () {
    let uniqueId = 0;

    before(() => {
        // Login and ensure clean setup of test assets
        cy.login() && cy.setupClean();
        
        cy.ensureMetadataPresent();
    })

    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));
    })

    describe('Existing metadata', () => {
        it('should show metadata about a person', function () {
            // Go to a metadata page about a patient
            cy.visit("/metadata/persons/E2E-TEST");

            // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
            cy.get("main").contains("Metadata");

            // Expect the id to be shown on the page,
            cy.contains("Id: E2E-TEST");

            // Expect at least a name field with the correct value
            cy.contains("Name")
                .parent("li")
                .find('input').first()
                .should('have.value', 'Person 1');
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

        it('should allow editing of metadata', function () {
            const personName = 'New user ' + uniqueId;

            // Go to a metadata page about a patient
            cy.visit("/metadata/persons/E2E-TEST");

            // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
            cy.get("main").contains("Metadata");

            // Enter a new value for the name
            cy.contains("Name")
                .parent("li")
                .find('input').first()
                .clear().type(personName)
                .blur();

            // Go to a metadata page about a patient
            cy.reload();

            cy.contains("Name")
                .parent("li")
                .find('input').first()
                .should('have.value', personName);
        })

        // Due to a bug described in VRE-282 and VRE-157 this
        // test does not succeed yet. However, it should, after the
        // fix for those issues has been implemented.
        xit('should allow deletion of metadata', function () {
            // Go to a metadata page about a patient
            cy.visit("/metadata/persons/E2E-TEST");

            // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
            cy.get("main").contains("Metadata");

            // Enter a new value for the name
            cy.contains("E2E-TEST-consent")
                .parents("li").last()
                .then(li => cy.clickButtonOnHover(li))

            // Wait until the request has finished
            cy.wait(300);

            // Reload the page
            cy.reload();

            // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
            cy.get("main").contains("Metadata");
            cy.contains("Loading").should('not.exist');

            cy.contains("E2E-TEST-consent")
                .should('not.exist');
        })
    });

    describe('Adding metadata', () => {
        it.only('should allow addition of new entities', () => {
            cy.visit("/metadata");
            cy.contains("button", "add").click();

            // Wait for the dialog to appear
            cy.contains("Create new metadata entity")

            // Store the identifier
            let id;
            return cy.contains("label", "Id")
                .parent()
                .find('input').first()
                .invoke('val')
                .then(val => {
                    id = val;
                })
                .then(() => {
                    // Select the 'Biological Sample' entry
                    cy.contains('[role="button"]', "Biological Sample").click();
                    cy.contains("button", "Create").click();

                    // We should go to the page for the newly created entity
                    cy.url().should('contain', '/biological-samples/');
                    cy.url().should('contain', id);

                    // Ensure there is an id and that the name field is shown
                    // This only happens if the entity is actually found in the metadata store
                    cy.contains(id);
                    cy.contains("label", "Name");
                })
        })
    });

});
