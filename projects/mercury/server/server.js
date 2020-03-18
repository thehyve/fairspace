const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const YAML = require('yaml');
const fs = require('fs');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const cryptoRandomString = require('crypto-random-string');
const KeycloakAdminClient = require('keycloak-admin').default;

const app = express();

const port = process.env.PORT || 8081;

let configPath = path.join(__dirname, 'config', 'config.yaml');
if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, 'devconfig.yaml');
}

const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

app.get('/liveness', (req, res) => res.status(200).send('Mercury is up and running.').end());

app.get('/readiness', (req, res) => res.status(200).end('Ready'));

const store = new session.MemoryStore();

const keycloak = new Keycloak(
    {
        store
    },
    {
        authServerUrl: config.urls.keycloak + '/auth',
        realm: config.keycloak.realm,
        clientId: config.keycloak.clientId,
        secret: process.env.KEYCLOAK_CLIENT_SECRET
    }
);

// Return 401 Unauthorized for API requests
keycloak.redirectToLogin = (request) => !request.baseUrl.startsWith('/api/');

app.use(session({
    secret: cryptoRandomString({length: 32}),
    resave: false,
    saveUninitialized: true,
    // Uncomment to limit the session lifetime to 1 minute
    // cookie: {maxAge: 60 * 1000 },
    store
}));

app.set('trust proxy', true);

app.use('/api/v1/workspaces/*/webdav', (req, res, next) => {
    if (!req.session['keycloak-token']) {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Basic ')) {
            const [username, password] = Buffer.from(auth.substr('Basic '.length), 'base64').toString('utf8').split(':');
            keycloak.grantManager.obtainDirectly(username, password)
                .then(grant => keycloak.storeGrant(grant, req, res))
                .catch(() => {
                    res.status(401).end('Unauthorized');
                    return Promise.reject();
                })
                .then(() => next());
        } else {
            res.status(401).header('WWW-Authenticate', 'Basic').end();
        }
    } else {
        next();
    }
});

app.use(keycloak.middleware({logout: '/logout'}));
app.use(keycloak.protect());
app.use(['/api/**', '/login'], keycloak.enforcer([], {response_mode: 'token'}));

const addToken = (proxyReq, req) => proxyReq.setHeader('Authorization', `Bearer ${req.kauth.grant.access_token.token}`);

app.use(proxy('/api/keycloak', {
    target: config.urls.keycloak,
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/' + config.keycloak.realm},
    onProxyReq: addToken,
    changeOrigin: true
}));

app.use(['/api/v1/workspaces/:workspace/**', '/api/v1/search/:workspace/**'], (req, res, next) => {
    const {authorities} = req.kauth.grant.access_token.content;
    if (authorities.includes('organisation-admin') || authorities.find(auth => auth.startsWith(`workspace-${req.params.workspace}-`))) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
});

app.use(proxy('/api/v1/search', {
    target: config.urls.elasticsearch,
    pathRewrite: () => `/fairspace/_search`
}));

const createKeycloakAdminClient = () => {
    const client = new KeycloakAdminClient({baseUrl: `${config.urls.keycloak}/auth`, realmName: config.keycloak.realm});
    return client.auth({
        grantType: 'client_credentials',
        clientId: config.keycloak.clientId,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    }).then(() => client)
        .catch(e => {
            console.error("Error establishing admin client connection", e);
            console.error(`Check whether the service account for client ${config.keycloak.clientId} in realm ${config.keycloak.realm} is enabled and granted view-users role`);
            return Promise.reject(e);
        });
};


app.get('/api/v1/users', (req, res) => {
    createKeycloakAdminClient(config)
        .then(client => client.users.find())
        .then(users => users
            .filter(user => user.enabled)
            .map(user => ({
                id: user.id,
                fullName: user.fullName || ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || user.username,
                email: user.email,
                username: user.username
            })))
        .then(users => res.send(users))
        .catch(e => {
            console.error('Error retrieving users', e);
            res.status(500).end('Internal server error');
        });
});

app.get('/api/v1/account', (req, res) => {
    const {content} = req.kauth.grant.access_token;
    res.send({
        id: content.sub,
        username: content.preferred_username,
        fullName: content.name,
        firstName: content.given_name,
        lastName: content.family_name,
        authorizations: content.realm_access.roles
    });
});

app.use(proxy('/api/**', {
    target: config.urls.saturn,
    onProxyReq: addToken
}));


const clientDir = path.join(path.dirname(__dirname), 'client');

// Serve any static files
app.use(express.static(clientDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));


// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
