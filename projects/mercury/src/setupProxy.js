const proxy = require('http-proxy-middleware');

const BACKEND_URL = 'http://localhost:8080/';

module.exports = (app) => {
    app.use(proxy('/api/v1', {
        target: BACKEND_URL
    }));
};
