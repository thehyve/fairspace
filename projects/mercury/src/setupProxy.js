const proxy = require('http-proxy-middleware');

const MOCKED_SERVER_URL = 'http://localhost:5000/';
const SEARCH_URL = 'http://localhost:9200/';
const BACKEND_URL = 'http://localhost:8080/';

// '/api/v1/projects/project/collections/' -> ['', 'api', 'v1', 'projects', 'project', 'collections', '']
const getProjectId = (url) => url.split('/')[4];

module.exports = (app) => {
    app.use(proxy('/config', {target: MOCKED_SERVER_URL}));
    app.use(proxy('/api/v1/account', {target: MOCKED_SERVER_URL}));
    app.use(proxy('/api/v1/*/users', {target: MOCKED_SERVER_URL}));
    app.use(proxy('/api/keycloak/users', {target: MOCKED_SERVER_URL}));

    // to talk to a real ES instance on localhost
    app.use(proxy('/api/v1/search', {
        target: SEARCH_URL,
        pathRewrite: (url) => `/${getProjectId(url)}/_search`
    }));

    app.use(proxy('/api/v1/projects/*/**', {
        target: BACKEND_URL
    }));

    app.use(proxy('/api/v1', {target: BACKEND_URL}));
};
