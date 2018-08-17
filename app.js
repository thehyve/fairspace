const app = require('express')();

const webdav = require('webdav-server').v2;

const rootPath = process.env.FILES_FOLDER || '/data';

const server = new webdav.WebDAVServer({
    rootFileSystem: new webdav.PhysicalFileSystem(rootPath)
});

app.get('/', (req, res) => res.send('Hi, I\'m Titan!').end());

app.use(webdav.extensions.express('/webdav/', server));

module.exports = app;
