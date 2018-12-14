// When testing from electron for a PR, the cache control settings used
// for reloading the collaborators are not respected. That causes the
// test to fail, because it does not see the updated settings.
describe('Collection collaborators', function () {
    let uniqueId = 0;
    let collectionName = '';
    let fileUrl;

    before(() => {
        console.error("Start logging in")
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
        cy.contains('[role="dialog"] button', 'Submit').click();

        // Ensure its visibility on the screen
        getCollaboratorsCard()
            .contains('Test UserRead').should('exist')

        // Now remove the collaborator
        getCollaboratorsCard()
            .contains('li', 'Test UserRead')
            .then(li => cy.clickButtonOnHover(li))

        cy.contains('#more-menu li', 'Delete').click();
        cy.contains('button', 'Submit').click();

        // Ensure he is removed
        getCollaboratorsCard()
            .contains('Test UserRead').should('not.exist')
        // Wait until Titan's cache expires
        cy.wait(90000);
    });

    const getCollaboratorsCard = () =>
        cy.contains('Collaborators:')
            .parents('[role="button"]').first().parent()
});
