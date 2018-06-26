const express = require('express')
const app = express()
const port = process.env.PORT || 5000;

app.get('/account/name', (req, res) => res.send({username: 'John Butler'}));
app.get('/account/authorizations', (req, res) => res.send(["user-workspace1", "ROLE_USER"]));

app.listen(port, () => console.log('Example app listening on port ' + port ))