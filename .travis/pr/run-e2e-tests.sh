#!/bin/bash
cd ../../projects/janus
npm install

# Wait for the keycloak-configuration script to be finished before
# actually starting the e2e tests
# TODO

export KEYCLOAK_URL=http://localhost:21000/
export SECOND_USER=test2-e2e

node_modules/.bin/cypress run \
  --spec 'cypress/integration/services/**/*
  --config baseUrl=http://localhost:22000,user_name=e2e-test,password=e2e-test

