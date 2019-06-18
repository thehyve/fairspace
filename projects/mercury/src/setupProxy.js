const proxy = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(proxy('/config/config.json', {target: 'http://localhost:5000/'}));
    app.use(proxy('/api/v1/workspace', {target: 'http://localhost:5000/'}));
    app.use(proxy('/api/v1/account', {target: 'http://localhost:5000/'}));

    // to talk to a real ES instance on localhost
    app.use(proxy('/api/v1/search', {
        target: 'http://localhost:9200/',
        pathRewrite: {
            '^/api/v1/search': '' // remove base path
        }
    }));

    app.use(proxy('/api/v1', {target: 'http://localhost:8080/'}));
    app.use(proxy('/webdav/v1', {target: 'http://localhost:8080/'}));
};
