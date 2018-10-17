describe('File list and upload', function () {
    let collectionName;

    before(() => {
        cy.login(Cypress.config("user_name"), Cypress.config("password"));

        const uniqueId = Math.round(100000 + (Math.random() * 900000));
        collectionName = "Collection for files" + uniqueId;

        cy.listCollections();
        cy.addCollection(collectionName);
    })

    after(() => {
        cy.listCollections();
        cy.deleteLastCollectionByName(collectionName);
        cy.logout()
    })

    it('should allow uploading and downloading files', function () {
        // Go into the last collection
        cy.get('tr').contains(collectionName).click().click();

        // Close right panel to avoid it being in the way
        cy.closeRightPanel();
        cy.wait(300);

        // Wait for the upload button and upload the file
        cy.get("button[aria-label=Upload]").click();
        cy.upload_file("input[type=file]", 'myfile.txt');

        // Normally a user does not have to reload
        // but it seems that cypress needs it to run the test properly
        cy.reload()

        // Verify proper upload
        cy.contains("myfile.txt")
            // If we double click the file, we should be able to download it
            .click().click();

        cy.url().should('contain', 'myfile.txt');
    });
});
