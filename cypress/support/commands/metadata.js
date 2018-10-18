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

Cypress.Commands.add("ensureMetadataPresent", () => {
    const workspaceUrl = Cypress.config("baseUrl");
    cy.fixture('metadata.json', 'base64')
        .then(data => {
            data['@context']['ws'] = workspaceUrl + '/iri/';

            cy.request({
                method: 'POST',
                url: '/api/metadata/statements',
                body: JSON.stringify(data),
                headers: {'Content-type': 'application/ld+json'}
            })
        });
})
