#!/bin/bash

npm install
npm build
CI=true DISPLAY=:99 npm test
