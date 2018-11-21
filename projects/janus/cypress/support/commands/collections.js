// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("listCollections", () => {
    cy.visit("/collections");
    cy.contains('main', 'Collections').should('exist');
    cy.contains("Loading").should('not.exist');
})

Cypress.Commands.add("addCollection", (name, description) => {
    cy.url().should('contain', '/collections')

    // Add a collection
    cy.contains('button', 'add').click({force: true});

    // Enter parameters if given
    if(name) {
        cy.get('input[name=name]').clear();
        cy.get('input[name=name]').type(name);
    }
    if(description) {
        cy.get('textarea[name=description]').clear();
        cy.get('textarea[name=description]').type(changedDescription);
    }

    // Click save
    cy.contains('button', 'Save').click();

    // Wait until the collections have been loaded
    cy.contains("Loading").should('not.exist');
    cy.contains('tr', name).should('exist');
});

Cypress.Commands.add("addCollectionFast", (overrides = {}) => {
    return cy.fixture('empty-collection.json')
        .then(data =>
            cy.request({
                method: 'POST',
                url: '/api/collections',
                body: JSON.stringify({...data,...overrides}),
                headers: {'Content-type': 'application/json'}
            })
        );
});

Cypress.Commands.add("deleteCollectionFast", (collectionId) => {
    cy.request({
        method: 'DELETE',
        url: '/api/collections/' + collectionId,
    })
});

Cypress.Commands.add("deleteLastCollectionByName", (name) => {
    cy.url().should('contain', '/collections')

    cy.contains('tr', name)
        .should('exist')
        .then(deleteCollection);
})

Cypress.Commands.add("waitForRightPanel", () => {
    cy.contains('button', 'close').should('be.visible');
    cy.contains("Loading").should("not.exist");
});

Cypress.Commands.add("closeRightPanel", () => {
    cy.contains('button', 'close').click({force: true});
});

Cypress.Commands.add("setupClean", () => {
    // Remove all old collections
    cy.request('/api/collections')
        .then(data => {
            expect(data.status).to.equal(200);

            return Promise.all(data.body.map(collection => cy.request('DELETE', '/api/collections/' + collection.id)));
        });

    // Ensure at least a single collection
    cy.addCollectionFast();
})


function deleteCollection(row) {
    cy.clickButtonOnHover(row);

    // Confirm deletion
    cy.contains('button', 'Yes').click({force:true});

    // Wait a bit to ensure deletion
    cy.wait(100);
}
