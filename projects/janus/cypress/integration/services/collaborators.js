describe('Collection collaborators', function () {
    let uniqueId = 0;
    let collectionName = '';
    let fileUrl;

    before(() => {
        // Login and ensure clean setup of test assets
        cy.login() && cy.setupClean();
        
        uniqueId = Math.round(100000 + (Math.random() * 900000));
        collectionName = 'collaborator ' + uniqueId;

        // Prepare collection with single file
        cy.prepareCollectionWithFile(collectionName)
            .then(url => fileUrl = url);
    })

    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));
    });

    it('should be visible along with a collection', function () {
        cy.listCollections();
        cy.contains('tr', collectionName).click();

        // Find the test user name in the list of collaborators
        getCollaboratorsCard()
            .contains('First UserManage').should('exist')
    });

    it('should allow addition and deletion of collaborators', function () {
        cy.listCollections();
        cy.contains('tr', collectionName).click();

        getCollaboratorsCard().within(() => cy.get('button[aria-label="Add"]').click({force:true}));

        // Add other user as collaborator
        cy.get('[role="dialog"] input[type="text"]').click({force:true})
        cy.contains('Test User').click();
        cy.contains('button', 'Submit').click();

        // Ensure its visibility on the screen
        getCollaboratorsCard()
            .contains('Test UserRead').should('exist')

        // Login as the other user
        cy.logout();
        cy.login(Cypress.env("SECOND_USER"), Cypress.config("password"));
        cy.listCollections();

        // Verify the existence of the collection and files
        cy.contains('tr', collectionName)
            .should('exist')
            .click().click();

        // The user should be able to download the files
        cy.contains('tr', 'myfile.txt').should('exist');
        cy.request(fileUrl).its('status').should('equal', 200);

        // Login again as the first user
        cy.login();
        cy.listCollections();

        // Now remove the collaborator
        cy.contains('tr', collectionName).click();
        getCollaboratorsCard()
            .contains('li', 'Test UserRead')
            .then(li => cy.clickButtonOnHover(li))

        cy.contains('#more-menu li', 'Delete').click();
        cy.contains('button', 'Submit').click();

        // Ensure he is removed
        getCollaboratorsCard()
            .contains('Test UserRead').should('not.exist')

        // Login as the other user
        cy.login(Cypress.env("SECOND_USER"), Cypress.config("password"));
        cy.listCollections();

        // Verify the existence of the collection and files
        cy.contains('Collections');
        cy.contains('tr', collectionName)
            .should('not.exist')

        cy.request({url: fileUrl, failOnStatusCode: false}).its('status').should('equal', 401);

        // Login again as the first user
        cy.login();

    });

    const getCollaboratorsCard = () =>
        cy.contains('Collaborators:')
            .parents('[role="button"]').first().parent()
});
