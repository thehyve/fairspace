const express = require('express');
const webdav = require('webdav-server').v2;
const fixWebdavDestinationMiddleware = require('./fixWebdavDestinationMiddleware');
const port = process.env.PORT || 5000;

// Start a generic server on port 5000 that serves default API
const app = express();
app.get('/api/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

// Account API
app.get('/account/user', (req, res) => res.sendFile(__dirname + '/user.json'));
app.get('/account/authorizations', (req, res) => res.send(["user-workspace1", "ROLE_USER"]));

// Collections API
app.post('/api/collections', (req, res) => res.send());
app.get('/api/collections', (req, res) => res.sendFile(__dirname + '/collection-list.json'));
app.get('/api/collections/:id', (req, res) => res.sendFile(__dirname + '/collection-' + req.params.id + '.json'));
app.get('/api/collections/:id/permissions', (req, res) => res.sendFile(__dirname + '/collection-' + req.params.id + '-permissions.json'));
app.patch('/api/collections/:id', (req, res) => res.send());
app.delete('/api/collections/:id', (req, res) => setTimeout(() => res.send(), 3000));

// Metadata API
app.get('/api/metadata/statements', (req, res) => res.sendFile(__dirname + '/metadata-1.json'));
app.patch('/api/metadata/statements', (req, res) => res.send());

// Workspace API
app.get('/api/workspace/users', (req, res) => res.sendFile(__dirname + '/users.json'));
app.get('/api/workspace/config', (req, res) => res.sendFile(__dirname + '/workspace-config.json'));

// Add webdav server on /files
const server = new webdav.WebDAVServer();

server.rootFileSystem().addSubTree(server.createExternalContext(), {
    'quotes': {
        'file1.txt': webdav.ResourceType.File,
        'file2.txt': webdav.ResourceType.File
    },
    'samples': {
        'samples.txt': webdav.ResourceType.File,
        'other-sample.csv': webdav.ResourceType.File
    },
    'external': {
        'external-data.txt': webdav.ResourceType.File,
        'sub-dir': {
            'subdirfile.txt': webdav.ResourceType.File,
            'another-dir': {
                'deeply-nested.txt': webdav.ResourceType.File,
            }
        }
    }
})

app.use(fixWebdavDestinationMiddleware('/api/storage/webdav'));
app.use(webdav.extensions.express('/api/storage/webdav', server))

app.listen(port, () => console.log('Backend stub listening on port ' + port ))
