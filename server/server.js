const express = require('express')
const app = express()
const port = process.env.PORT || 5000;

app.get('/account/name', (req, res) => res.send({username: 'John Butler'}));
app.get('/account/authorizations', (req, res) => res.send(["user-workspace1", "ROLE_USER"]));
app.get('/config/config.json', (req, res) => res.send({}));

app.listen(port, () => console.log('Backend stub listening on port ' + port ))
