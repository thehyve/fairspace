const proxy = require('http-proxy-middleware');
const path = require('path');

const mockDataDir = path.join(__dirname, '../mock-server/mock-data');

module.exports = (app) => {
    // Might not be the best way, should improve
    if (process.title.includes('dev:real')) {
        app.get('/account/user', (req, res) => res.sendFile(`${mockDataDir}/user.json`));
        app.get('/account/authorizations', (req, res) => res.send(['user-workspace1', 'ROLE_USER']));

        app.get('/api/workspace/users', (req, res) => res.sendFile(`${mockDataDir}/workspace/users.json`));
        app.get('/api/workspace/config', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-config.json`));
        app.get('/api/workspace/details', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-details.json`));


        app.use(proxy('/api/search', {
            target: 'http://localhost:9200/',
            pathRewrite: {
                '^/api/search': '' // remove base path
            }
        }));
    } else {
        app.use(proxy('/api/search', {target: 'http://localhost:5000/'}));
    }

    app.use(proxy('/api/workspace', {target: 'http://localhost:5000/'}));
    app.use(proxy('/api', {target: 'http://localhost:8080/'}));
    app.use(proxy('/webdav', {target: 'http://localhost:8080/'}));
    app.use(proxy('/account', {target: 'http://localhost:5000/'}));
};
