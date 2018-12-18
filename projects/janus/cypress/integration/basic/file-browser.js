describe('File browser', function () {
    const collectionName = 'TestCollection';
    let uniqueId;

    before(() => {
        // Login and ensure clean setup of test assets
        cy.login() && cy.setupClean();
    })
    
    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));
    });

    it('should allow uploading and downloading of files', function () {
        cy.listCollections();

        // Go into the last collection
        cy.contains('tr', collectionName)
            .click().click();

        // Close right panel to avoid it being in the way
        cy.closeRightPanel();
        cy.wait(200);

        // Wait for the upload button and upload the file
        cy.get("button[aria-label=Upload]").click();
        cy.uploadFile("input[type=file]", 'myfile.txt');

        cy.wait(400);

        // Normally a user does not have to reload
        // but it seems that cypress needs it to run the test properly
        cy.reload()

        // Verify proper upload
        cy.contains("myfile.txt")
            // If we double click the file, we should be able to download it
            .click().click();

        cy.url().should('contain', 'myfile.txt');
    });

    it('should allow basic file operations', function () {
        cy.listCollections();

        // Go into the last collection
        cy.contains('tr', collectionName)
            .click().click();

        // Close right panel to avoid it being in the way
        cy.closeRightPanel();
        cy.wait(200);

        // Create a new directory
        cy.get('button[aria-label="Create directory"]').click();
        cy.get("input[name=name]").clear().type('newdirectory');
        cy.contains("button", "Create").click();

        // Wait for the list to be refreshed
        cy.contains('tr', 'newdirectory')
            .should('exist')

        // Rename directory
        cy.contains('tr', 'newdirectory')
            .then(row => cy.clickButtonOnHover(row, 'button[aria-label="Rename newdirectory"]'))
        cy.get("input[name=name]").clear().type('renamed');
        cy.contains("button", "Rename").click();

        // Delete directory
        cy.contains('tr', 'renamed')
            .then(row => cy.clickButtonOnHover(row, 'button[aria-label="Delete renamed"]'))
        cy.contains('button', 'Submit').click({force:true});

        // Wait for deletion to be shown
        cy.contains('tr', 'renamed')
            .should('not.exist')
    });

    it('should allow copying of files', function () {
        const collectionName = "Copy and move files " + uniqueId;

        // Prepare uploaded file
        cy.prepareCollectionWithFile(collectionName, 'metadata.json');

        // Go to the collection
        cy.listCollections();

        // Go into the last collection
        cy.contains('tr', collectionName)
            .click().click();

        // Verify the file is there and select it
        cy.contains("tr", "metadata.json")
            .should('exist')
            .click();

        // Copy the file
        cy.get('button[aria-label="Copy"]').click();

        // Paste the file
        cy.get('button[aria-label="Paste"]').click();

        // Verify the file is copied
        cy.contains("tr", "metadata.json").should('exist')
        cy.contains("tr", "metadata (2).json").should('exist')
    });


});
