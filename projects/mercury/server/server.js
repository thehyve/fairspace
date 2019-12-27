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

const store = new session.MemoryStore();

const keycloak = new Keycloak(
    {
        store
    },
    {
        'auth-server-url': config.urls.keycloak + '/auth',
        'realm': config.keycloak.realm,
        'ssl-required': 'external',
        'resource': config.keycloak.clientId,
        'credentials': {
            secret: config.keycloak.clientSecret
        },
        'confidential-port': 0
    }
);

app.use(session({
    secret: cryptoRandomString({length: 32}),
    resave: false,
    saveUninitialized: true,
    store
}));

app.use(keycloak.middleware({logout: '/logout'}));

// app.use('/**', keycloak.protect(), (res, req, next) => next());

const {workspaces} = config.urls;

const allProjects = (auth) => Promise.all(workspaces.map(url => fetch(url + '/api/v1/projects/', {headers: {Authorization: auth}})
    .then(response => response.json())
    .then(projects => projects.map(p => ({workspace: url, ...p})))
    .catch(() => [])))
    .then(responses => responses.reduce((x, y) => [...x, ...y], []));

// TODO: implement
const projectNameByPath = (url) => "workspace-ci";

const workspaceByPath = (url, auth) => {
    const project = projectNameByPath(url);
    return allProjects(auth)
        .then(all => all.find(p => p.name === project))
        .then(p => p && p.workspace);
};

app.get('/api/v1/workspaces', (req, res) => res.send(workspaces));

// All projects from all workspaces
app.get('/api/v1/projects', (req, res) => allProjects(req.header('Authorization')).then(all => res.send(all)));


app.use(proxy('/api/keycloak', {
    target: config.urls.keycloak,
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/' + config.keycloak.realm},
    changeOrigin: true
}));

app.use(proxy('/api/v1/search/fairspace/_search', {
    target: config.urls.elasticsearch,
    pathRewrite: (url) => `/${projectNameByPath(url)}/_search`
}));

app.use(proxy('/api/v1', {
    target: 'http://never.ever',
    router: req => workspaceByPath(req.path, req.header('Authorization'))
}));

const clientDir = path.join(path.dirname(__dirname), 'client');

// Serve any static files
app.use(express.static(clientDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
