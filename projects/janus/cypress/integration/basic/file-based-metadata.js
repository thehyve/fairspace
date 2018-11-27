describe('File-based metadata', function () {
    const collectionName = 'TestCollection';
    let uniqueId;

    before(() => {
        // Login and ensure clean setup of test assets
        cy.login() && cy.setupClean();
    })
    
    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));

        cy.listCollections();

        // Go into the last collection
        cy.contains('tr', collectionName)
            .click().click();
    });

    it('should store parent-child relation on directory creation', () => {
        createDirectory('metadata-dir');

        // Wait for the list to be refreshed
        cy.contains('tr', 'metadata-dir')
            .should('exist')

        // Wait sometime and refresh to ensure that the metadata is propagated
        cy.reload();

        cy.contains('tr', 'metadata-dir')
            .should('exist').click()

        // The number of elements in the list should be the same as the number
        // of elements in the metadata list
        cy.get("tbody tr").its("length")
            .then(length => {
                getMetadataContainer("Collection metadata", "Contains file")
                    .find("li")
                    .its("length").should('eq', length)
            })

        // Verify that there is a link from the directory to the file
        cy.url().then(currentUrl => {
            // As the hostname may be different for e2e testing, we
            // only check the path part
            const currentPath = new URL(currentUrl).pathname;
            getMetadataContainer("Metadata for metadata-dir", "Part of collection")
                .find("li a")
                .should('have.attr', 'href')
                .should('contain', currentPath)
        })
    })

    it('should retain metadata when renaming', () => {
        createDirectory('initial-dir-' + uniqueId);

        // Refresh to ensure that the metadata is propagated
        cy.reload();

        // Open metadata pane
        cy.contains('tr', 'initial-dir-' + uniqueId)
            .should('exist').click()

        // Enter data for name
        getMetadataContainer("Metadata for initial-dir-" + uniqueId, "Description")
            .find('textarea:not([aria-hidden])').first()
            .clear().type("name-" + uniqueId)
            .blur();

        // Wait a short while for storing the metadata
        cy.wait(200);

        // Rename directory
        cy.contains('tr', 'initial-dir-' + uniqueId)
            .then(row => cy.clickButtonOnHover(row, 'button[aria-label="Rename initial-dir-' + uniqueId + '"]'))
        cy.get("input[name=name]").clear().type('new-dir-' + uniqueId);
        cy.contains("button", "Rename").click();

        // Wait sometime and refresh to ensure that the metadata is propagated
        cy.wait(500);
        cy.reload();

        // Verify the metadata has been moved as well
        cy.contains('tr', 'new-dir-' + uniqueId)
            .should('exist').click()

        getMetadataContainer("Metadata for new-dir-" + uniqueId, "Description")
            .find('textarea:not([aria-hidden])').first()
            .should('have.value', "name-" + uniqueId);
    });

    it('should retain metadata (recursively) when copying', () => {
        // Create a new directory
        createDirectory('copy-' + uniqueId);

        // Go into the directory
        cy.contains('tr', 'copy-' + uniqueId)
            .should('exist').click().click()

        // Create a new subdirectory
        createDirectory('dir-' + uniqueId);

        // Open metadata pane
        cy.contains('tr', 'dir-' + uniqueId)
            .should('exist').click()

        // Enter data for name
        getMetadataContainer("Metadata for copy-" + uniqueId + "/dir-" + uniqueId, "Description")
            .find('textarea:not([aria-hidden])').first()
            .clear().type("sub-directory-" + uniqueId)
            .blur();

        // Wait a short while for storing the metadata
        cy.wait(200);



        // Go back to the root of the collection
        cy.contains('a', collectionName).click();

        // Copy the initially created directory
        createDirectory('target-' + uniqueId);

        cy.contains('tr', 'copy-' + uniqueId)
            .should('exist').click();

        // Copy the file into the new directory
        cy.get('button[aria-label="Copy"]').click();

        // Go into the target directory
        cy.contains('tr', 'target-' + uniqueId)
            .should('exist').click().click();

        // Paste the directory
        cy.contains('No files')
        cy.get('button[aria-label="Paste"]').click();

        // Wait sometime and refresh to ensure that the metadata is propagated
        cy.wait(500);
        cy.reload();

        // Verify the metadata on the subdirectory within the copied directory
        cy.contains('tr', 'copy-' + uniqueId).click().click()

        // Open metadata pane
        cy.contains('tr', 'dir-' + uniqueId)
            .should('exist').click()

        // Verify the metadata has been moved as well
        getMetadataContainer("Metadata for target-" + uniqueId + "/copy-" + uniqueId + "/dir-" + uniqueId, "Description")
            .find('textarea:not([aria-hidden])').first()
            .should('have.value', "sub-directory-" + uniqueId);
    });


    const getMetadataContainer = (containerTitle, fieldName) =>
        cy.contains('[role="button"]', containerTitle)
            .parent()
            .contains("label", fieldName)
            .parent("li")

    const createDirectory = (name) => {
        cy.get('button[aria-label="Create directory"]').click();
        cy.get("input[name=name]").clear().type(name);
        cy.contains("button", "Create").click();

        // Wait sometime and refresh to ensure that the metadata is propagated
        cy.get('[role="dialog"]').should('not.exist');
        cy.wait(300);
    }



});
