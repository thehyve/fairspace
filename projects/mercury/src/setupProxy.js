const proxy = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(proxy('/api/workspace', {target: 'http://localhost:5000/'}));
    app.use(proxy('/api', {target: 'http://localhost:8080/'}));
    app.use(proxy('/webdav', {target: 'http://localhost:8080/'}));
    app.use(proxy('/account', {target: 'http://localhost:5000/'}));
};
