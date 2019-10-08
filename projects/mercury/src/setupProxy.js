const proxy = require('http-proxy-middleware');

const MOCKED_SERVER_URL = 'http://localhost:5000/';
const SEARCH_URL = 'http://localhost:9200/';
const BACKEND_URL = 'http://localhost:8080/';

module.exports = (app) => {
    app.use(proxy('/config', {target: MOCKED_SERVER_URL}));
    app.use(proxy('/api/v1/account', {target: MOCKED_SERVER_URL}));
    app.use(proxy('/api/v1/users', {target: MOCKED_SERVER_URL}));
    app.use(proxy('/api/keycloak/users', {target: MOCKED_SERVER_URL}));

    // to talk to a real ES instance on localhost
    app.use(proxy('/api/v1/search', {
        target: SEARCH_URL,
        pathRewrite: {
            '^/api/v1/search': '' // remove base path
        }
    }));

    app.use(proxy('/api/v1', {target: BACKEND_URL}));
    app.use(proxy('/webdav/v1', {target: BACKEND_URL}));
};
