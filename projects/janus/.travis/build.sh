#!/bin/bash

set -e
npm ci
$(npm bin)/mocha api-tests/*.js --timeout 5000
$(npm bin)/cypress run
