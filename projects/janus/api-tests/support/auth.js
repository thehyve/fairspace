const request = require('superagent');
const config = require('./config');
const tokenUrl = config.keycloak.uri + '/auth/realms/' + config.keycloak.realm + '/protocol/openid-connect/token';
const sessionUrl = config.workspaceUri + '/account/tokens';

async function retrieveToken(username = config.username, password = config.password) {
    const tokenResponse = await request.post(tokenUrl)
        .type('form')
        .send({
            'username': username,
            'password': password,
            'grant_type': 'password',
            'client_id': config.keycloak.publicClientId
        });

    return tokenResponse.body;
}

async function retrieveSessionId(username = config.username, password = config.password) {
    const credentials = await retrieveToken(username, password)

    return request
        .post(sessionUrl)
        .send({
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token
        }).then(response => response.body.sessionId);
}

async function retrieveSessionCookie(username = config.username, password = config.password) {
    const sessionId = await retrieveSessionId(username, password)
    return "JSESSIONID=" + sessionId;
}

function authenticatedRequest(sessionCookie) {
    return (method, url) => request(method, url)
        .set('Cookie', sessionCookie)
        .timeout(config.timeouts.requestTimeout);
}

module.exports = {
    retrieveToken,
    retrieveSessionId,
    retrieveSessionCookie,
    authenticatedRequest
}
