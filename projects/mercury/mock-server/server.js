const express = require('express');
const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const fetch = require("node-fetch");

const mockDataDir = path.join(__dirname, '/mock-data');
const port = process.env.PORT || 5000;
// Start a generic server on port 5000 that serves default API
const app = express();

// Add a delay to make the loading visible
// app.use((req, res, next) => setTimeout(next, 1000));


app.get('/api/v1/status/:httpStatus(\\d+)', (req, res) => res.status(req.params.httpStatus).send({status: req.params.httpStatus}));

app.get('/config/config.json', (req, res) => res.sendFile(`${mockDataDir}/workspace/workspace-config.json`));
app.get('/config/version.json', (req, res) => res.sendFile(`${mockDataDir}/workspace/version.json`));

// Account API
app.get('/api/v1/account', (req, res) => res.sendFile(`${mockDataDir}/user.json`));

app.get('/api/v1/workspaces', (req, res) => res.json(['http://localhost:8080']).end());

const MOCKED_USERS_LOCATION = `${mockDataDir}/keycloak-users.json`;

// Users search
app.get('/api/keycloak/users', (req, res) => res.sendFile(MOCKED_USERS_LOCATION));

app.get('/api/v1/users', (req, res) => res.sendFile(`${mockDataDir}/users.json`));

const json = express.json();

// Create a new project
app.put('/api/v1/projects/', (req, res) => {
    json(req, res, () => {
        const project = req.body;

        // A project is created when it is accessed for the first time
        fetch(`http://localhost:8080/api/v1/projects/${project.id}/collections/`,
            {headers: {Accept: 'application/json'}})
            .then(saturnsResponse => saturnsResponse.json())
            .then(body => {
                res.status(200).type('application/json').send(body);
            });
    });
});

app.listen(port);
