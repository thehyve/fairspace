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

app.get('/api/v1/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

app.get('/config/config.json', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-config.json`));
app.get('/config/version.json', (req, res) => res.sendFile(`${mockDataDir}/workspace/version.json`));

// Account API
app.get('/api/v1/account', (req, res) => res.sendFile(`${mockDataDir}/user.json`));

// Workspace API
app.get('/api/keycloak/users', (req, res) => res.sendFile(`${mockDataDir}/keycloak-users.json`));


app.listen(port);
