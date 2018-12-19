#!/bin/bash
echo -e "travis_fold:start:e2e-tests"

echo -e $(date +%T) "Installing modules"
cd projects/janus
npm ci

export WORKSPACE_URL=http://localhost:22000
export STORAGE_URL=http://localhost:22000
export CYPRESS_KEYCLOAK_URL=http://keycloak:8080
export CYPRESS_KEYCLOAK_PUBLIC_CLIENT_ID=e2e-public
export CYPRESS_KEYCLOAK_REALM=e2e
export CYPRESS_SECOND_USER=test2
export CYPRESS_USERNAME=test1
export CYPRESS_PASSWORD=e2e

# Set large timeouts as the ci environment tends to respond slowly
export METADATA_PROPAGATION_TIME=4000
export REQUEST_TIMEOUT=4000
export TEST_TIMEOUT=15000

echo -e $(date +%T) "Running API tests"
$(npm bin)/mocha api-tests/*.js --timeout $TEST_TIMEOUT
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
