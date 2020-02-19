const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const fetch = require("node-fetch");
const YAML = require('yaml');
const fs = require('fs');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const cryptoRandomString = require('crypto-random-string');
const {fullname} = require("./roles");
const {setRole} = require("./roles");
const {listUsers, createWorkspaceRoles} = require("./roles");
const ElasticsearchClient = require('./ElasticsearchClient');

const app = express();

const port = process.env.PORT || 8081;

let configPath = path.join(__dirname, 'config', 'config.yaml');
if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, 'devconfig.yaml');
}

const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

const elasticsearchClient = new ElasticsearchClient(config.urls.elasticsearch);

let allWorkspaces;

const fetchWorkspaces = () => elasticsearchClient.retrieveWorkspaces()
    .then(results => { allWorkspaces = results; })
    .catch(e => console.error('Error retrieving workspaces', e));

fetchWorkspaces();
setInterval(() => fetchWorkspaces(), 30000);

app.get('/liveness', (req, res) => res.status(200).send('Mercury is up and running.').end());

app.get('/readiness', (req, res) => {
    if (allWorkspaces) {
        res.status(200).end('Ready');
    } else {
        res.status(503).end('Initializing');
    }
});

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

let accessToken;

// Grab a parsed token
app.use('/**', keycloak.protect((token) => {
    accessToken = token;
    return true;
}));

app.use(['/api/**', '/login'], keycloak.enforcer([], {response_mode: 'token'}));

// '/api/v1/workspaces/workspace/collections/' -> ['', 'api', 'v1', 'workspaces', 'workspace', 'collections', '']
const getWorkspaceId = (url) => url.split('/')[4];

const getNodeUrl = (url) => {
    const workspaceId = getWorkspaceId(url);
    const workspace = allWorkspaces.find(p => p.id === workspaceId);
    return (workspace && workspace.node) || ('/unknown-workspace/' + workspaceId);
};

app.use('/unknown-workspace/:workspace', (req, res) => res.status(404).send('Unknown workspace: ' + req.params.workspace));

app.get('/api/v1/nodes', (req, res) => res.send(config.urls.nodes).end());

// All workspaces from all workspaces
app.get('/api/v1/workspaces', (req, res) => res.send(allWorkspaces).end());

const workspacesBeingCreated = new Set();

const json = express.json();

const WORKSPACE_ID_PATTERN = /^[a-z][-a-z0-9]*$/;

const createWorkspaceDatabase = (workspace) => fetch(`${workspace.node}/api/v1/workspaces/${workspace.id}/collections/`, {headers: {Authorization: `Bearer ${accessToken.token}`}})
    .then(nodeResponse => { if (!nodeResponse.ok) { throw Error('Error creating workspace database'); }});

// Create a new workspace
app.put('/api/v1/workspaces', (req, res) => {
    if (!accessToken.content.authorities.includes('organisation-admin')) {
        res.status(403).send('Forbidden');
        return;
    }
    json(req, res, () => {
        const workspace = req.body;

        if (!config.urls.nodes.includes(workspace.node)) {
            res.status(400).send('Unknown node URL');
            return;
        }
        if (!workspace.id || !(WORKSPACE_ID_PATTERN).test(workspace.id)) {
            res.status(400).send('Invalid workspace id: ' + workspace.id);
            return;
        }
        if (allWorkspaces.find(p => p.id === workspace.id)) {
            res.status(400).send('This workspace id is already taken: ' + workspace.id);
            return;
        }
        if (workspacesBeingCreated.has(workspace.id)) {
            res.status(400).send('A workspace with this id is already being created: ' + workspace.id);
            return;
        }

        workspacesBeingCreated.add(workspace);

        // A workspace is created when it is accessed for the first time
        createWorkspaceRoles(config, workspace.id)
            .then(() => createWorkspaceDatabase(workspace))
            .then(() => fetchWorkspaces())
            .then(() => res.status(200).send(workspace))
            .catch(e => {
                console.error('Error creating a workspace. '
                    + `Check the permissions granted to Fairspace service account ${process.env.FAIRSPACE_SERVICE_ACCOUNT_USERNAME}.`
                    + 'They must include at least view-realm, manage-realm, manage-authorization and manage-users.', e);
                res.status(500).send('Internal server error');
            })
            .finally(() => workspacesBeingCreated.delete(workspace.id));
    });
});

const addToken = (proxyReq) => proxyReq.setHeader('Authorization', `Bearer ${accessToken.token}`);

app.use(proxy('/api/keycloak', {
    target: config.urls.keycloak,
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/' + config.keycloak.realm},
    onProxyReq: addToken,
    changeOrigin: true
}));

// Cross workspaces search
app.get('/api/v1/search/_all', (req, res) => {
    const {query} = req.query;
    elasticsearchClient.retrieveSearchTypes()
        .then(types => elasticsearchClient.crossWorkspacesSearch(query, types))
        .then(result => res.send(result).end())
        .catch(e => console.error('Error retrieving cross-workspace search results.', e));
});

app.use(proxy('/api/v1/search', {
    target: config.urls.elasticsearch,
    pathRewrite: (url) => `/${getWorkspaceId(url)}/_search`
}));

app.get('/api/v1/account', (req, res) => res.send({
    id: accessToken.content.sub,
    username: accessToken.content.preferred_username,
    fullName: accessToken.content.name,
    firstName: accessToken.content.given_name,
    lastName: accessToken.content.family_name,
    authorizations: accessToken.content.realm_access.roles
}));

app.get('/api/v1/workspaces/:workspace/users', (req, res) => {
    if (!accessToken.content.authorities.includes('organisation-admin')
        && !accessToken.content.authorities.includes(`workspace-${req.params.workspace}-coordinator`)
        && !accessToken.content.authorities.includes(`workspace-${req.params.workspace}-datasteward`)
        && !accessToken.content.authorities.includes(`workspace-${req.params.workspace}-write`)
        && !accessToken.content.authorities.includes(`workspace-${req.params.workspace}-user`)) {
        res.status(403).send('Forbidden');
        return;
    }
    listUsers(config, req.params.workspace)
        .then(users => res.send(users).end())
        .catch(e => {
            console.error('Error while listing users', e);
            res.status(500).send('Internal server error');
        });
});

app.put('/api/v1/workspaces/:workspace/users/:userId/roles/:roleType', (req, res) => {
    if (!accessToken.content.authorities.includes('organisation-admin')
        && !accessToken.content.authorities.includes(`workspace-${req.params.workspace}-coordinator`)) {
        res.status(403).send('Forbidden');
        return;
    }
    setRole(config, req.params.workspace, req.params.userId, req.params.roleType)
        .then(user => fetch(`${getNodeUrl(req.originalUrl)}/api/v1/workspaces/${req.params.workspace}/users/`, {method: 'PUT',
            headers: {Authorization: `Bearer ${accessToken.token}`},
            body: JSON.stringify({id: user.id, email: user.email, name: fullname(user)})}))
        .then(nodeResponse => res.status(nodeResponse.ok ? 200 : 500).send())
        .catch(e => {
            console.error('Error while altering roles', e);
            res.status(500).send('Internal server error');
        });
});


app.use(proxy('/api/v1/workspaces/*/**', {
    target: 'http://never.ever',
    router: req => getNodeUrl(req.originalUrl),
    onProxyReq: addToken
}));


const clientDir = path.join(path.dirname(__dirname), 'client');

// Serve any static files
app.use(express.static(clientDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));


// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
