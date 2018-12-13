#!/bin/bash

npm ci
node_modules/.bin/cypress run
