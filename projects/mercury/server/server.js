const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');
const fetch = require("node-fetch");
const YAML = require('yaml');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

const configPath = path.join(__dirname, 'config', 'config.yaml');
const devConfig = {workspaces: ['http://localhost:8080'], elasticsearch: 'http://localhost:9200'};
const config = fs.existsSync(configPath) ? YAML.parse(fs.readFileSync(configPath, 'utf8')) : devConfig;
const {workspaces} = config;

const allProjects = () => Promise.all(workspaces.map(url => fetch(url + '/api/v1/projects/')
    .then(response => response.json())
    .then(projects => projects.map(p => ({workspace: url, ...p})))
    .catch(() => [])))
    .then(responses => responses.reduce((x, y) => [...x, ...y], []));

// TODO: implement
const projectNameByPath = (url) => "project1";

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
    target: 'https://keycloak.ci.fairway.app',
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/ci'},
    changeOrigin: true
}));

app.use(proxy('/api/v1/search', {
    target: config.elasticsearch,
    pathRewrite: {'^/api/v1/search/': '/'}
}));

app.use(proxy('/api/v1', {
    target: 'http://never.ever',
    router: req => workspaceByPath(req.path)
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
