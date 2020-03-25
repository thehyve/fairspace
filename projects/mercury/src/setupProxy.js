const proxy = require('http-proxy-middleware');

const SEARCH_URL = 'http://localhost:9200/';
const BACKEND_URL = 'http://localhost:8080/';

// '/api/v1/workspaces/workspace/collections/' -> ['', 'api', 'v1', 'workspaces', 'workspace', 'collections', '']
const getWorkspaceId = (url) => url.split('/')[4];

module.exports = (app) => {
    // to talk to a real ES instance on localhost
    app.use(proxy('/api/v1/search', {
        target: SEARCH_URL,
        pathRewrite: (url) => `/${getWorkspaceId(url)}/_search`
    }));

    app.use(proxy('/api/v1/workspaces/*/**', {
        target: BACKEND_URL
    }));

    app.use(proxy('/api/v1', {
        target: BACKEND_URL
    }));
};
