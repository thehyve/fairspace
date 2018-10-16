#!/bin/bash

cd charts/${APPNAME}

# Clean
rm -rf charts
rm -rf *.tgz

# Build
rm -rf requirements.lock
helm dependency build
helm lint
