const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const bodyParser = require('body-parser');
const path = require('path');

const mockDataDir = path.join(__dirname, '/mock-data');
const port = process.env.PORT || 5000;
// Start a generic server on port 5000 that serves default API
const app = express();

// Add a delay to make the loading visible
// app.use((req, res, next) => setTimeout(next, 1000));

// parse application/json
app.use(bodyParser.json());

app.get('/api/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

// Account API
app.get('/account/user', (req, res) => res.sendFile(`${mockDataDir}/user.json`));
app.get('/account/authorizations', (req, res) => res.send(['user-workspace1', 'ROLE_USER']));


// Workspace API
app.get('/api/workspace/users', (req, res) => res.sendFile(`${mockDataDir}/workspace/users.json`));
app.get('/api/workspace/config', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-config.json`));
app.get('/api/workspace/details', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-details.json`));

// Search (ElasticSearch) API
// app.post('/api/search/fairspace/_search', (req, res) => {
//     const specialSearches = ['no-results', 'no-highlights'];
//     const query = req.body.query.bool.must[0].query_string.query;

//     const filename = specialSearches.indexOf(query) > -1 ? query : 'generic-results';

//     res.sendFile(`${mockDataDir}/search/${filename}.json`);
// });

app.listen(port);
