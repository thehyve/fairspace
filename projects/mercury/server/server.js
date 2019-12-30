const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const fetch = require("node-fetch");
const YAML = require('yaml');
const fs = require('fs');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const cryptoRandomString = require('crypto-random-string');
const NodeCache = require("node-cache");

const app = express();
const port = process.env.PORT || 8081;

let configPath = path.join(__dirname, 'config', 'config.yaml');
if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, 'devconfig.yaml');
}

const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

const clientDir = path.join(path.dirname(__dirname), 'client');

// Liveness probe
app.get('/', (req, res) => res.sendFile(path.join(clientDir, 'index.html')));

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

app.use((req, res, next) => {
    Object.defineProperty(req, "protocol", {value: 'https', writable: true});
    next();
});

app.use(keycloak.middleware({logout: '/logout'}));

app.use('/**', keycloak.protect(), (res, req, next) => next());

app.use('/api/**', keycloak.enforcer([], {response_mode: 'token'}), (req, res, next) => next());

app.use((req, res, next) => {
    req.protocol = 'http';
    next();
});

const {workspaces} = config.urls;

const projectsCache = new NodeCache({stdTTL: 30});
let projectsPromise = null;

const workspaceProjects = (url, auth) => fetch(url + '/api/v1/projects/', {headers: {Authorization: auth}})
    .then(response => {
        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(projects => projects.map(p => ({workspace: url, ...p})))
    .catch(e => {
        console.error(`Error retrieving projects for workspace ${url}:`, e);
        return [];
    });

const allProjects = (auth) => {
    const cached = projectsCache.get("");
    if (cached) {
        return Promise.resolve(cached);
    }

    if (!projectsPromise) {
        projectsPromise = Promise.all(workspaces.map(url => workspaceProjects(url, auth)))
            .then(responses => {
                const result = responses.reduce((x, y) => [...x, ...y], []);
                projectsCache.set("", result);
                projectsPromise = undefined;
                return result;
            });
    }

    return projectsPromise;
};


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
app.get('/api/v1/projects', (req, res) => {
    const auth = req.get('Authorization') || (req.session['keycloak-token'] && `Bearer ${req.session['keycloak-token'].access_token}`);
    console.log(`Authorization: ${auth}`);
    allProjects(auth).then(all => res.send(all));
});



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

// Serve any static files
app.use(express.static(clientDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
