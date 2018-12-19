#!/bin/bash

set -e
npm ci

export METADATA_PROPAGATION_TIME=1000
export REQUEST_TIMEOUT=4000

$(npm bin)/mocha api-tests/*.js --timeout 12000
$(npm bin)/cypress run
