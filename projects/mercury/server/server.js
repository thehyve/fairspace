const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const fetch = require("node-fetch");
const YAML = require('yaml');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8081;

let configPath = path.join(__dirname, 'config', 'config.yaml');
if (!fs.existsSync(configPath)) {
    configPath = path.join(__dirname, 'devconfig.yaml');
}

const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));
const {workspaces} = config.urls;

const allProjects = () => Promise.all(workspaces.map(url => fetch(url + '/api/v1/projects/')
    .then(response => response.json())
    .then(projects => projects.map(p => ({workspace: url, ...p})))
    .catch(() => [])))
    .then(responses => responses.reduce((x, y) => [...x, ...y], []));

// TODO: implement
const projectNameByPath = (url) => "Project1";

const workspaceByPath = (url) => {
    const project = projectNameByPath(url);
    return allProjects()
        .then(all => all.find(p => p.name === project))
        .then(p => p && p.workspace);
};

app.get('/api/v1/workspaces', (req, res) => res.send(workspaces));

// All projects from all workspaces
app.get('/api/v1/projects', (req, res) => allProjects().then(all => res.send(all)));


app.use(proxy('/api/keycloak', {
    target: config.urls.keycloak,
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/' + config.keycloak.realm},
    changeOrigin: true
}));

app.use(proxy('/api/v1/search', {
    target: config.urls.elasticsearch,
    pathRewrite: {'^/api/v1/search/': '/'}
}));

app.use('/api/v1/**', (req, res, next) => workspaceByPath(req.path)
    .then(target => {
        req.target = target;
        console.log(`Proxying ${req.path} to ${target}`);
        next();
    }));

app.use(proxy('/api/v1', {
    target: 'http://never.ever',
    router: req => req.target
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
