#!/bin/bash

set -e
npm ci

export METADATA_PROPAGATION_TIME=1000
export REQUEST_TIMEOUT=2000

$(npm bin)/mocha api-tests/*.js --timeout 10000
$(npm bin)/cypress run
