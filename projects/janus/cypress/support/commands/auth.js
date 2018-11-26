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
Cypress.Commands.add("logout", () => {
    cy.clearCookies();
    cy.clearCookie('JSESSIONID');
})

Cypress.Commands.add('login', (overrides = {}) => {
    Cypress.log({
        name: 'loginBySingleSignOn'
    })

    // Perform a call to keycloak
    const url = Cypress.env('KEYCLOAK_URL') + '/auth/realms/' + Cypress.env('KEYCLOAK_REALM') + '/protocol/openid-connect/token';

    const options = {
        method: 'POST',
        url: url,
        form: true, // we are submitting a regular form body
        body: {
            username: Cypress.env('USERNAME'),
            password: Cypress.env("PASSWORD"),
            grant_type: 'password',
            client_id: Cypress.env('KEYCLOAK_PUBLIC_CLIENT_ID')
        }
    }

    // allow us to override defaults with passed in overrides
    options.body = Object.assign(options.body, overrides)

    return cy.request(options)
        .then(response =>
            cy.request({
                url: Cypress.config('baseUrl') + "/account/tokens",
                method: 'POST',
                body: {
                    accessToken: response.body.access_token,
                    refreshToken: response.body.refresh_token
                }
            })
        )
})

const clearCookies = () => {
    // // We have to clear the cookies both in keycloak and in
    // // our own system. However, Cypress only allows us to clear
    // // cookies for a single host at a time
    // cy.visit(Cypress.env('KEYCLOAK_URL'));
    // cy.clearCookies();
    // cy.clearCookie('JSESSIONID');
    //
    cy.visit(Cypress.config('baseUrl'));
    cy.clearCookies();
    cy.clearCookie('JSESSIONID');
}
