#!/bin/bash

npm install
CI=true DISPLAY=:99 npm test
