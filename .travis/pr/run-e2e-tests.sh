#!/bin/bash
echo -e "travis_fold:start:\"Running e2e tests\""

cd projects/janus
npm install

# Wait for the keycloak-configuration script to be finished before
# actually starting the e2e tests
configuration_container=$(docker ps -aqf "name=keycloak-config_1")
echo -e "Waiting for container keycloak-config_1 ($configuration_container) to finish..."
docker wait $configuration_container

export CYPRESS_KEYCLOAK_URL=http://keycloak:8080
export CYPRESS_KEYCLOAK_PUBLIC_CLIENT_ID=e2e-public
export CYPRESS_KEYCLOAK_REALM=e2e
export CYPRESS_SECOND_USER=test2-e2e
export CYPRESS_USERNAME=e2e-test
export CYPRESS_PASSWORD=e2e-test

node_modules/.bin/cypress run \
  --spec cypress/integration/basic/**/*.js \
  --config baseUrl=http://localhost:22000

echo -e "travis_fold:end:\"Running e2e tests\""
