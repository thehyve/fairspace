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

Cypress.Commands.add("login", (username = Cypress.config('user_name'), password = Cypress.config("password")) => {
    clearCookies();

    cy.visit('');
    cy.url().should('include', '/auth/realms');
    cy.get('input[name=username]').type(username);
    cy.get('input[name=password').type(password + '{enter}');
})

Cypress.Commands.add("logout", () => {
    clearCookies();
    cy.visit('');
})

const clearCookies = () => {
    // We have to clear the cookies both in keycloak and in
    // our own system. However, Cypress only allows us to clear
    // cookies for a single host at a time
    cy.visit(Cypress.env('KEYCLOAK_URL'));
    cy.clearCookies();
    cy.clearCookie('JSESSIONID');

    cy.visit(Cypress.config('baseUrl'));
    cy.clearCookies();
    cy.clearCookie('JSESSIONID');
}
