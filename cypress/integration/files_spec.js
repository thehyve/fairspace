describe('File list and upload', function () {
    const collectionName = 'TestCollection';

    it('should allow uploading and downloading files', function () {
        cy.listCollections();

        // Go into the last collection
        cy.contains('tr', collectionName)
            .click().click();

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
