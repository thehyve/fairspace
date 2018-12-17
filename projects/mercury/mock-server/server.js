const express = require('express');
const webdav = require('webdav-server').v2;
const bodyParser = require('body-parser');
const fs = require('fs');
const fixWebdavDestinationMiddleware = require('./fixWebdavDestinationMiddleware');
const port = process.env.PORT || 5000;
const mockDataDir = __dirname + '/mock-data';

// Start a generic server on port 5000 that serves default API
const app = express();

// Add a delay to make the loading visible
// app.use((req, res, next) => setTimeout(next, 3000));

// parse application/json
app.use(bodyParser.json());

app.get('/api/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

// Account API
app.get('/account/user', (req, res) => res.sendFile(mockDataDir + '/user.json'));
app.get('/account/authorizations', (req, res) => res.send(["user-workspace1", "ROLE_USER"]));

// Collections API
app.post('/api/collections', (req, res) => res.send());
app.get('/api/collections', (req, res) => res.sendFile(mockDataDir + '/collections/collection-list.json'));
app.get('/api/collections/:id', (req, res) => res.sendFile(mockDataDir + '/collections/collection-' + req.params.id + '.json'));
app.get('/api/collections/:id/permissions', (req, res) => res.sendFile(mockDataDir + '/collections/collection-' + req.params.id + '-permissions.json'));
app.patch('/api/collections/:id', (req, res) => res.send());
app.delete('/api/collections/:id', (req, res) => setTimeout(() => res.send(), 3000));
app.put('/api/collections/permissions', (req, res) => res.send({
    access: req.body.access,
    collection: req.body.collection,
    subject: req.body.subject
}));
// Metadata API
app.get('/api/metadata/statements', (req, res) => {
    if(req.query.subject) {
        res.sendFile(mockDataDir + '/metadata/metadata-1.json')
    } else {
        res.sendFile(mockDataDir + '/metadata/persons.json')
    }
});

app.get('/api/metadata/extended/statements', (req, res) =>
    fs.readFile(mockDataDir + '/metadata/metadata-with-labels.json', (err, data) => {
        res.set('Content-Type', 'application/json');
        res.send(data.toString().replace(/ws:subject/g, req.query.subject));
    })
);

app.patch('/api/metadata/statements', (req, res) => res.send());
app.delete('/api/metadata/statements', (req, res) => res.send());
app.post('/api/metadata/query', (req, res) => res.sendFile(mockDataDir + '/metadata/all-entities.json'));

// Workspace API
app.get('/api/workspace/users', (req, res) => res.sendFile(mockDataDir + '/workspace/users.json'));
app.get('/api/workspace/config', (req, res) => res.sendFile(mockDataDir + '/workspace/workspace-config.json'));
app.get('/api/workspace/details', (req, res) => res.sendFile(mockDataDir + '/workspace/workspace-details.json'));


app.post('/api/metadata/pid', (req, res) => {
    res.send({id:'http://fairspace.com' + req.body.value, value: req.body.value})
});

// Add webdav server on /files
const server = new webdav.WebDAVServer();

server.rootFileSystem().addSubTree(server.createExternalContext(), {
    'Jan_Smit_s_collection-500': {
        'dir1': webdav.ResourceType.Directory,
        'file1.txt': webdav.ResourceType.File,
        'file2.txt': webdav.ResourceType.File,
        'sub-dir': {
            'subdirfile.txt': webdav.ResourceType.File,
            'another-dir': {
                'deeply-nested.txt': webdav.ResourceType.File,
            }
        }
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
});

app.use(fixWebdavDestinationMiddleware('/api/storage/webdav'));
app.use(webdav.extensions.express('/api/storage/webdav', server));

app.listen(port, () => console.log('Backend stub listening on port ' + port ));
