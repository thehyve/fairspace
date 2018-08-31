describe('Collection browser', function () {
    let uniqueId = 0;

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
        cy.get('tbody>tr').its('length').then(length => rowCount = length);

        cy.addCollection();

        // Verify the number of rows has increased
        cy.get('tbody>tr').should('length.above', rowCount);

        // Remove the last entry again
        cy.deleteLastCollection();

    });

    it('should store changes in collection details', function () {
        cy.listCollections();
        cy.addCollection();

        // Find one of the collections created with the default name
        // Click on it to open the right panel
        cy.get('tr').contains("Test workspace-ci's collection").click();

        // Wait for the right panel to open
        cy.wait(500);

        // Click on the name to edit it
        cy.get('h2').contains("Test workspace-ci's collection").click();

        // Determine a random number to avoid having accidental successes

        let changedName = 'changed ' + uniqueId;
        let changedDescription = 'description ' + uniqueId;

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
        cy.get('tr')
            .contains(changedName)
            .parentsUntil('tbody')
            .find("button").click();

    });
});
