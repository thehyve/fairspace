const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(proxy('/api/keycloak', {
    target: 'https://keycloak.ci.fairway.app',
    pathRewrite: {'^/api/keycloak': '/auth/admin/realms/ci'},
    changeOrigin: true
}));

app.use(proxy('/api/v1/search/fairspace', {
    target: 'http://hyperspace-ci-elasticsearch-client.hyperspace-ci.svc.cluster.local:9200',
    pathRewrite: {'^/api/v1/search/fairspace': '/workspace-ci'}
}));

app.use(proxy('/api/v1', {target: 'http://workspace-ci-saturn.workspace-ci.svc.cluster.local'}));

const clientDir = path.join(path.dirname(__dirname), 'client');
// Serve any static files
app.use(express.static(clientDir));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
});

// eslint-disable-next-line no-console
app.listen(port, () => console.log(`Listening on port ${port}`));
