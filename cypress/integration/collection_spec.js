describe('Collection browser', function () {
    let uniqueId = 0;
    const collectionName = "John Snow's collection";

    before(() => {
        cy.login(Cypress.config("user_name"), Cypress.config("password"));
    })

    after(() => {
        cy.logout()
    })

    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));
    });

    it('should show a list of collections', function () {
        cy.listCollections();

        cy.get('tbody').find('tr').should('length.above', 0);
    });

    it('should successfully add and remove a collection', function () {
        cy.listCollections();

        // Count the current number of collections
        let rowCount = 0;

        cy.get('tbody>tr').its('length')
            .then(length => rowCount = length)

            // Add a collection only after counting
            .then(cy.addCollection)

            // Verify the number of rows has increased
            .then(() => cy.get('tbody>tr').should('length.above', rowCount))

            // Recount the number of rows
            .then(() => cy.get('tbody>tr').its('length'))
            .then((length) => rowCount = length)

            // Remove the last entry again
            .then(() => cy.deleteLastCollectionByName(collectionName))

            .then(() => cy.get('tbody>tr').should('length.below', rowCount));
    });

    it('should store changes in collection details', function () {
        cy.listCollections();
        cy.addCollection();

        // Find one of the collections created with the default name
        // Click on it to open the right panel
        cy.get('tr').contains(collectionName).click();

        // Wait for the right panel to open
        cy.waitForRightPanel();

        // Click on the name to edit it
        cy.get('h2').contains(collectionName).click({force:true});

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
        cy.get('ul>li')
            .should('contain', changedName)
            .should('contain', changedDescription);

        // The collection details  should be present after reloading
        cy.listCollections();
        cy.get('tr')
            .should('contain', changedName)
            .should('contain', changedDescription);

        // Delete the collection again
        cy.deleteLastCollectionByName(changedName);

    });
});
