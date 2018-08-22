const app = require('express')();
const webdav = require('webdav-server').v2;
const rootPath = process.env.FILES_FOLDER || '/data';
const noopHttpAuthentication = require('./noop-http-authentication');

const server = new webdav.WebDAVServer({
    httpAuthentication: noopHttpAuthentication,
    rootFileSystem: new webdav.PhysicalFileSystem(rootPath)
});

app.get('/', (req, res) => res.send('Hi, I\'m Titan!').end());

app.use(webdav.extensions.express('/api/storage/webdav/', server));

module.exports = app;
