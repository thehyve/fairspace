describe('Collection browser', function () {
    let uniqueId = 0;

    before(() => {
        // Login and ensure clean setup of test assets
        cy.login() && cy.setupClean();
    })
    
    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));
    });

    it('should show a list of collections', function () {
        cy.listCollections();
    });

    it('should successfully add and remove a collection', function () {
        const collectionName = 'New collection ' + uniqueId;

        // List collections
        cy.listCollections();

        // Count the current number of collections
        let rowCount = 0;

        cy.get('tbody>tr').its('length')
            .then(length => rowCount = length)

            // Add a collection only after counting
            .then(() => cy.addCollection('New collection ' + uniqueId))

            // Verify the number of rows has increased
            .then(() => cy.get('tbody>tr').should('length.above', rowCount))

            // Verify the new name is in the list
            .then(() => cy.get('tr').should('contain', collectionName))

            // Recount the number of rows
            .then(() => cy.get('tbody>tr').its('length'))
            .then((length) => rowCount = length)

            // Remove the last entry again
            .then(() => cy.deleteLastCollectionByName(collectionName))

            // Verify the number  of rows decreased
            .then(() => cy.get('tbody>tr').should('length.below', rowCount))

    });

    it('should store changes in collection details', function () {
        const collectionName = 'Update collection ' + uniqueId;

        cy.addCollectionFast({ name: collectionName });
        cy.listCollections();

        // Find one of the collections created with the default name
        // Click on it to open the right panel
        cy.get('tr').contains(collectionName).click();

        // Wait for the right panel to open
        cy.waitForRightPanel();

        // Click on the name to edit it
        cy.contains('h2', collectionName).click({force:true});

        // Determine a random number to avoid having accidental successes
        let changedName = 'changed ' + uniqueId;
        let changedDescription = 'description ' + uniqueId;

        cy.wait(100);

        cy.get('input[name=name]').should('be.visible');

        // Alter the name
        cy.get('input[name=name]').clear().type(changedName);
        cy.get('textarea[name=description]').clear().type(changedDescription);
        cy.get('button').contains('Save').click();

        // The collection details should be updated immediately
        cy.contains('h2', collectionName).should('not.exist');
        cy.contains('h2', changedName).should('exist');
        cy.contains('p', changedDescription).should('exist');

        // The collection details  should be present after reloading
        cy.listCollections();
        cy.get('tr')
            .should('contain', changedName)
            .should('contain', changedDescription);
    });
});
