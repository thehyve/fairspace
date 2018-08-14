const express = require('express')
const cors = require('cors')
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
app.get('/metadata/collections', (req, res) => res.sendFile(__dirname + '/collection-metadata.json'));

// Collections
app.get('/collections', (req, res) => res.sendFile(__dirname + '/collections.json'));
app.post('/collections', (req, res) => res.send());

// Files
app.get('/files/L3F1b3Rlcw/children', (req, res) => res.sendFile(__dirname + '/files-root.json'));


app.listen(port, () => console.log('Backend stub listening on port ' + port ))
