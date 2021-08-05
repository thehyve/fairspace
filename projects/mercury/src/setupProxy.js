const proxy = require('http-proxy-middleware');
// eslint-disable-next-line import/no-extraneous-dependencies
const Keycloak = require('keycloak-connect');
// eslint-disable-next-line import/no-extraneous-dependencies
const session = require('express-session');

module.exports = (app) => {
    const store = new session.MemoryStore();

    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        // Uncomment to limit the session lifetime to 1 minute
        // cookie: {maxAge: 60 * 1000 },
        store
    }));

    const keycloak = new Keycloak(
        {
            store
        },
        {
            authServerUrl: 'http://localhost:5100/auth',
            realm: 'fairspace',
            clientId: 'workspace-client',
            secret: '**********'
        }
    );

    // Return 401 Unauthorized for API requests
    keycloak.redirectToLogin = (request) => !(request.baseUrl.startsWith('/api/') || request.baseUrl.startsWith('/zuul/'));

    app.use(keycloak.middleware({logout: '/logout'}));
    app.use('/dev', keycloak.protect());

    const addToken = (proxyReq, req) => req.kauth.grant && proxyReq.setHeader('Authorization', `Bearer ${req.kauth.grant.access_token.token}`);

    app.use(proxy('/api', {
        target: 'http://localhost:8080/',
        onProxyReq: addToken
    }));

    app.use(proxy('/zuul', {
        target: 'http://localhost:8080/',
        onProxyReq: addToken
    }));

    app.use(proxy('/actuator/health', {
        target: 'http://localhost:8080/'
    }));
};
