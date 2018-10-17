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
    cy.contains("Loading").should('not.exist');
    cy.get("tbody").should('exist');
})

Cypress.Commands.add("addCollection", (name, description) => {
    cy.url().should('contain', '/collections')

    // Add a collection
    cy.get('button').contains("add").click({force: true});

    // Enter parameters if given
    if(name) {
        cy.get('input[name=name]').clear().type(name);
    }
    if(description) {
        cy.get('textarea[name=description]').clear().type(changedDescription);
    }

    // Click save
    cy.get('button').contains('Save').click();

    // Wait until the collections have been loaded
    cy.wait(500)
    cy.contains("Loading").should('not.exist');
})

Cypress.Commands.add("deleteLastCollectionByName", (name) => {
    cy.url().should('contain', '/collections')

    deleteCollection(
        cy.get('tr')
            .contains(name)
            .last()
            .parentsUntil('tbody'));
})

Cypress.Commands.add("waitForRightPanel", () => {
    cy.get('button').contains('close').should('be.visible');
    cy.contains("Loading").should("not.exist");
});

Cypress.Commands.add('upload_file', (selector, fileUrl, type = '') => {
    return cy.fixture(fileUrl, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then(blob => {
            const nameSegments = fileUrl.split('/');
            const name = nameSegments[nameSegments.length - 1];
            const testFile = new window.File([blob], name, { type });
            const event = { dataTransfer: { files: [testFile] }, force: true };
            return cy.get(selector).trigger('drop', event)
        })
});

function deleteCollection(row) {
    // Click the delete button
    row.find("button").click({force: true});

    // Confirm deletion
    cy.get("button").contains("Yes").click({force:true});

    // Wait a bit to ensure deletion
    cy.wait(300);
}
