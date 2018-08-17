const express = require('express');
const webdav = require('webdav-server').v2;
const port = process.env.PORT || 5000;

// Start a generic server on port 5000 that serves default API
const app = express();
app.get('/api/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

// Account API
app.get('/account/name', (req, res) => res.send({username: 'John Butler'}));
app.get('/account/authorizations', (req, res) => res.send(["user-workspace1", "ROLE_USER"]));

// Metadata API
app.post('/metadata/collections', (req, res) => res.send());
app.patch('/metadata/collections', (req, res) => res.send());
app.get('/metadata/collections', (req, res) => res.sendFile(__dirname + '/collection-list.json'));
app.get('/metadata/collections/:id', (req, res) => res.sendFile(__dirname + '/collection-' + req.params.id + '.json'));

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
        }
    }
})

app.use(webdav.extensions.express('/files', server))

app.listen(port, () => console.log('Backend stub listening on port ' + port ))
