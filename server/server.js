const express = require('express')
const cors = require('cors')
const port = process.env.PORT || 5000;
const storagePort = 5001;

// Start a generic server on port 5000 that serves default API
const app = express();
app.get('/config/config.json', (req, res) => res.send({ urls: { storage: 'http://localhost:5001' }}));
app.get('/api/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

// Account API
app.get('/account/name', (req, res) => res.send({username: 'John Butler'}));
app.get('/account/authorizations', (req, res) => res.send(["user-workspace1", "ROLE_USER"]));

// Metadata API
app.post('/metadata/collections', (req, res) => res.send());

app.listen(port, () => console.log('Backend stub listening on port ' + port ))

// Start a storage server on port 5001 that serves the storage api
const storage = express();

storage.use(cors({
    origin: function (origin, callback) {
        callback(null, true)
    },
    credentials: true
}));
storage.get('/', (req, res) => res.sendFile(__dirname  + '/listallbuckets-response.xml'));
storage.put('/:bucketName', (req, res) => res.header("Location", "/" + req.params.bucketName).status(200).send());

storage.listen(storagePort, () => console.log('Storage stub listening on port ' + storagePort ))

