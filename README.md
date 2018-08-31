# E2E Test suite for Fairspace

This project contains e2e tests to test the functionality for Fairspace against
the CI environment (https://workspace.ci.test.fairdev.app).

### Run the tests yourself
`npm install cypress`
`./node_modules/.bin/cypress run`

Alternatively you can start the interactive mode which allows you to easily 
run, debug and change the tests interactively:

`./node_modules/.bin/cypress open`


### Run the tests against another instance
You can specify the baseUrl against which the tests are being run as follows:

`./node_modules/.bin/cypress run --config baseUrl=http://localhost:8080`


