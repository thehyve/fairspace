const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const fetch = require("node-fetch");
const YAML = require('yaml');
const fs = require('fs');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const cryptoRandomString = require('crypto-random-string');
const elasticsearch = require('elasticsearch');

const app = express();


const port = process.env.PORT || 8081;

let configPath = path.join(__dirname, 'config', 'config.yaml');
if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, 'devconfig.yaml');
}

const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

const {workspaces} = config.urls;

const transformESHit = (hit) => (hit ? {
    ...hit._source,
    index: hit._index,
    id: hit._id,
    score: hit._score,
} : {});

const transformESResult = (esJson) => (
    esJson && esJson.hits && esJson.hits.hits ? esJson.hits.hits.map(transformESHit) : []
);

const mapProjectSearchItems = (items) => {
    const result = transformESResult(items);
    return result.map(item => ({
        id: item.index,
        workspace: (item.nodeUrl && item.nodeUrl.length ? item.nodeUrl[0] : undefined),
        label: (item.label && item.label.length ? item.label[0] : undefined),
        description: (item.projectDescription && item.projectDescription.length ? item.projectDescription[0] : undefined)
    }));
};

const esClient = new elasticsearch.Client({host: config.urls.elasticsearch, log: 'error'});

const getESProjects = () => {
    const sortDataCreated = [
        "_score",
        {
            dateCreated: {order: "desc"}
        }
    ];
    const esQuery = {
        bool: {
            must: [{
                query_string: {query: '*'}
            }],
            must_not: {
                exists: {
                    field: "dateDeleted"
                }
            },
            filter: [
                {
                    terms: {
                        "type.keyword": ["http://fairspace.io/ontology#Project"]
                    }
                }
            ]
        }
    };
    return esClient.search({
        index: "_all",
        body: {
            size: 10000,
            from: 0,
            sort: sortDataCreated,
            query: esQuery,
            highlight: {
                fields: {
                    "*": {}
                }
            }
        }
    }).then(mapProjectSearchItems);
};

let allProjects;

const fetchProjects = () => getESProjects()
    .then((result) => {
        allProjects = result;
    })
    .catch(e => {
        console.error('Error retrieving projects', e);
        process.exit(1);
    });

setInterval(() => fetchProjects(), 30000);

app.get('/liveness', (req, res) => res.status(200).send('Mercury is up and running.').end());

app.get('/readiness', (req, res) => {
    if (allProjects) {
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
        secret: config.keycloak.clientSecret
    }
);

app.use(session({
    secret: cryptoRandomString({length: 32}),
    resave: false,
    saveUninitialized: true,
    // Uncomment to limit the session lifetime to 1 minute
    // cookie: {maxAge: 60 * 1000 },
    store
}));

app.set('trust proxy', true);

app.use('/api/v1/projects/*/webdav', (req, res, next) => {
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

// '/api/v1/projects/project/collections/' -> ['', 'api', 'v1', 'projects', 'project', 'collections', '']
const getProjectId = (url) => url.split('/')[4];

const getWorkspaceUrl = (url) => {
    const projectId = getProjectId(url);
    const project = allProjects.find(p => p.id === projectId);
    return (project && project.workspace) || ('/unknown-project/' + projectId);
};

app.use('/unknown-project/:project', (req, res) => res.status(404).send('Unknown project: ' + req.params.project));

app.get('/api/v1/workspaces', (req, res) => res.send(workspaces).end());

// All projects from all workspaces
app.get('/api/v1/projects', (req, res) => res.send(allProjects).end());

const projectsBeingCreated = new Set();

const json = express.json();

const PROJECT_ID_PATTERN = /^[a-z][-a-z0-9]*$/;

// Create a new project
app.put('/api/v1/projects', (req, res) => {
    if (!accessToken.content.authorities.includes('organisation-admin')) {
        res.status(403).send('Forbidden');
        return;
    }
    json(req, res, () => {
        const project = req.body;

        if (!workspaces.includes(project.workspace)) {
            res.status(400).send('Unknown workspace URL');
            return;
        }
        if (!project.id || !(PROJECT_ID_PATTERN).test(project.id)) {
            res.status(400).send('Invalid project id: ' + project.id);
            return;
        }
        if (allProjects.find(p => p.id === project.id)) {
            res.status(400).send('This project id is already taken: ' + project.id);
            return;
        }
        if (projectsBeingCreated.has(project.id)) {
            res.status(400).send('A project with this id is already being created: ' + project.id);
            return;
        }

        projectsBeingCreated.add(project.id);

        // A project is created when it is accessed for the first time
        fetch(`${project.workspace}/api/v1/projects/${project.id}/collections/`,
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken.token}`
                }
            })
            .then(workspaceResponse => {
                if (workspaceResponse.ok) {
                    allProjects.push(project);
                }
                res.status(workspaceResponse.status).send(project);
            })
            .finally(() => projectsBeingCreated.delete(project.id));
    });
});

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

app.get('/api/v1/account', (req, res) => res.send({
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
