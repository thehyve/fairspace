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

Cypress.Commands.add("login", (username, password) => {
    cy.clearCookie("JSESSIONID")
    cy.visit('');
    cy.url().should('include', '/auth/realms');
    cy.get('input[name=username]').type(username);
    cy.get('input[name=password').type(password + '{enter}');
})

Cypress.Commands.add("logout", () => {
    cy.clearCookie("JSESSIONID")
    cy.visit('');
})

Cypress.Commands.add("listCollections", () => {
    cy.visit("/collections");
    cy.contains("Loading").should('not.exist');
    cy.get("tbody").should('exist');
})

Cypress.Commands.add("addCollection", () => {
    cy.url().should('contain', '/collections')

    // Add a collection
    cy.get('button').contains("add").click({force: true});

    // Recount after loading
    cy.wait(500)
    cy.contains("Loading").should('not.exist');
})

Cypress.Commands.add("deleteLastCollection", () => {
    cy.url().should('contain', '/collections')
    cy.get('tbody>tr').last()
        .find("button").click();
})


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