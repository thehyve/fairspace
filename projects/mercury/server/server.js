const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const fetch = require("node-fetch");
const YAML = require('yaml');
const fs = require('fs');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const cryptoRandomString = require('crypto-random-string');

const app = express();
const port = process.env.PORT || 8081;

let configPath = path.join(__dirname, 'config', 'config.yaml');
if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, 'devconfig.yaml');
}

const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

const {workspaces} = config.urls;

const workspaceProjects = (url) => fetch(url + '/api/v1/projects/')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Got ${response.status} ${response.statusText} from ${url}`);
        }
        return response.json();
    })
    .then(projects => projects.map(p => ({workspace: url, ...p})));

let allProjects;

Promise.all(workspaces.map(workspaceProjects))
    .then(responses => { allProjects = responses.reduce((x, y) => [...x, ...y], []); })
    .catch(e => {
        console.error('Error retrieving projects', e);
        process.exit(1);
    });

app.get('/liveness', (req, res) => res.status(200).send('Mercury is up and running.').end());

app.get('/readiness', (req, res) => {
    if (allProjects) {
        res.status(200).send('Ready.').end();
    } else {
        res.status(503).send('Initializing.').end();
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
        secret: config.keycloak.clientSecret
    }
);

app.use(session({
    secret: cryptoRandomString({length: 32}),
    resave: false,
    saveUninitialized: true,
    store
}));

// A hack to make proxying work
app.use((req, res, next) => {
    Object.defineProperty(req, "protocol", {value: 'https', writable: true});
    next();
});

app.use(keycloak.middleware({logout: '/logout'}));

let accessToken;

// Grab a parsed token
app.use('/**', keycloak.protect((token) => {
    accessToken = token;
    return true;
}), (res, req, next) => next());

app.use('/api/**', keycloak.enforcer([], {response_mode: 'token'}), (req, res, next) => next());

// Restore protocol
app.use((req, res, next) => {
    req.protocol = 'http';
    next();
});

// '/api/v1/projects/project/collections/' -> ['', 'api', 'v1', 'projects', 'project', 'collections', '']
const getProjectId = (url) => url.split('/')[4];

const getWorkspaceUrl = (url) => {
    const projectId = getProjectId(url);
    const project = allProjects.find(p => p.id === projectId);
    return project && project.workspace;
};

app.get('/api/v1/workspaces', (req, res) => res.json(workspaces).end());

// All projects from all workspaces
app.get('/api/v1/projects', (req, res) => res.json(allProjects).end());

const addToken = (proxyReq) => proxyReq.setHeader('Authorization', `Bearer ${accessToken.token}`);

app.use(proxy('/api/keycloak', {
    target: config.urls.keycloak,
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/' + config.keycloak.realm},
    onProxyReq: addToken,
    changeOrigin: true
}));

app.use(proxy('/api/v1/search', {
    target: config.urls.elasticsearch,
    pathRewrite: (url) => `/${getProjectId(url)}/_search`
}));

app.get('/api/v1/account', (req, res) => res.json({
    id: accessToken.content.sub,
    username: accessToken.content.preferred_username,
    fullName: accessToken.content.name,
    firstName: accessToken.content.given_name,
    lastName: accessToken.content.family_name,
    authorizations: accessToken.content.realm_access.roles
}));

app.use(proxy('/api/v1/projects/*/**', {
    target: 'http://never.ever',
    router: req => getWorkspaceUrl(req.originalUrl),
    onProxyReq: addToken
}));

const clientDir = path.join(path.dirname(__dirname), 'client');

// Serve any static files
app.use(express.static(clientDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
