const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const webdav = require('webdav-server').v2;
const bodyParser = require('body-parser');
const fs = require('fs');
const mockDataDir = require('path').join(__dirname, '/mock-data');

const port = process.env.PORT || 5000;


// Start a generic server on port 5000 that serves default API
const app = express();

// Add a delay to make the loading visible
app.use((req, res, next) => setTimeout(next, 1000));

// parse application/json
app.use(bodyParser.json());

app.get('/api/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

// Account API
app.get('/account/user', (req, res) => res.sendFile(`${mockDataDir}/user.json`));
app.get('/account/authorizations', (req, res) => res.send(['user-workspace1', 'ROLE_USER']));

// Collections API
app.put('/api/collections/', (req, res) => res.send());
app.get('/api/collections/', (req, res) => res.sendFile(`${mockDataDir}/collections/collection-list.json`));
app.get('/api/collections/:id/permissions', (req, res) => res.sendFile(`${mockDataDir}/collections/collection-${req.params.id}-permissions.json`));
app.patch('/api/collections/', (req, res) => res.send());
app.delete('/api/collections/', (req, res) => setTimeout(() => res.send(), 3000));
app.put('/api/collections/permissions', (req, res) => res.send({
    access: req.body.access,
    collection: req.body.collection,
    subject: req.body.subject
}));
// Metadata API
app.get('/api/metadata/', (req, res) => {
    const filePath = req.query.subject ? '/metadata/metadata-1.json' : '/metadata/persons.json';
    res.sendFile(mockDataDir + filePath);
});

app.get('/api/metadata/extended/statements',
    (req, res) => fs.readFile(`${mockDataDir}/metadata/metadata-with-labels.json`,
        (err, data) => {
            res.set('Content-Type', 'application/json');
            res.send(data.toString().replace(/ws:subject/g, req.query.subject));
        }));

app.patch('/api/metadata/', (req, res) => res.send());
app.delete('/api/metadata/', (req, res) => res.send());
app.get('/api/metadata/entities/', (req, res) => res.sendFile(`${mockDataDir}/metadata/all-entities.json`));

// Workspace API
app.get('/api/workspace/users', (req, res) => res.sendFile(`${mockDataDir}/workspace/users.json`));
app.get('/api/workspace/config', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-config.json`));
app.get('/api/workspace/details', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-details.json`));


app.get('/api/metadata/pids', ({query: {path}}, res) => {
    res.send(`http://fairspace.com/${path}`);
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

function fixWebdavDestinationMiddleware(path) {
    return (req, res, next) => {
        if (req.url.indexOf(path) !== 0) {
            return next();
        }

        // See if a destination header is given, if so, remove the
        // path-prefix from it, as the webdav server expects it not to
        // be there
        if (req.headers.destination) {
            req.headers.destination = req.headers.destination.replace(path, '');
        }

        return next();
    };
}

app.use(fixWebdavDestinationMiddleware('/webdav'));
app.use(webdav.extensions.express('/webdav', server));

app.listen(port);
