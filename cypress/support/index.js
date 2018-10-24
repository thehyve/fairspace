// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands/generic'
import './commands/auth'
import './commands/collections'
import './commands/metadata'
import './commands/files'

Cypress.Cookies.defaults({
    whitelist: [ "JSESSIONID" ]
});

before(() => {
    // Login
    cy.login(Cypress.config("user_name"), Cypress.config("password"));

    // Remove all old collections
    cy.request('/api/collections')
        .then(data => {
            expect(data.status).to.equal(200);

            return Promise.all(data.body.map(collection => cy.request('DELETE', '/api/collections/' + collection.id)));
        });

    // Ensure at least a single collection
    cy.addCollectionFast();
})
