#!/bin/bash
echo -e "travis_fold:start:e2e-tests"

echo -e $(date +%T) "Installing modules"
cd projects/janus
npm ci

# Wait for the keycloak-configuration script to be finished before
# actually starting the e2e tests
configuration_container=$(docker ps -aqf "name=keycloak-config_1")
echo -e $(date +%T) "Waiting for container keycloak-config_1 ($configuration_container) to finish..."
docker wait $configuration_container

export WORKSPACE_URL=http://localhost:22000
export STORAGE_URL=http://localhost:22000
export CYPRESS_KEYCLOAK_URL=http://keycloak:8080
export CYPRESS_KEYCLOAK_PUBLIC_CLIENT_ID=e2e-public
export CYPRESS_KEYCLOAK_REALM=e2e
export CYPRESS_SECOND_USER=test2-e2e
export CYPRESS_USERNAME=e2e-test
export CYPRESS_PASSWORD=e2e-test

echo -e $(date +%T) "Running API tests"
$(npm bin)/mocha api-tests/*.js --timeout 5000
result=$?

echo -e $(date +%T) "Running E2E tests"
if [[ $result -eq 0 ]]; then
    $(npm bin)/cypress run \
      --spec cypress/integration/basic/**/*.js \
      --config baseUrl=$WORKSPACE_URL

    result=$?
else
    echo "Skipping e2e tests because API tests failed already"
fi

echo -e "travis_fold:end:e2e-tests"
exit $result
