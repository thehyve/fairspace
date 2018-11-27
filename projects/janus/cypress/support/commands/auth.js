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

    // Store the tokens with pluto and retrieve a session id for authentication
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

// Login to keycloak using the browser itself. This mechanism
// is somewhat slower than the default method, but it can be used
// to demonstrate SSO with Jupyter
Cypress.Commands.add("loginWithBrowser", (username = Cypress.env('USERNAME'), password = Cypress.env('PASSWORD')) => {
    clearCookies();

    cy.visit('');
    cy.url().should('include', '/auth/realms');
    cy.get('input[name=username]').type(username);
    cy.get('input[name=password').type(password + '{enter}');
})

const clearCookies = () => {
    // // We have to clear the cookies both in keycloak and in
    // // our own system. However, Cypress only allows us to clear
    // // cookies for a single host at a time
    cy.visit(Cypress.env('KEYCLOAK_URL'));
    cy.clearCookies();
    cy.clearCookie('JSESSIONID');
    //
    cy.visit(Cypress.config('baseUrl'));
    cy.clearCookies();
    cy.clearCookie('JSESSIONID');
}
