#!/bin/bash
cd .travis/pr

# The env variable VERSION is used as tag for all docker images
# This means that it will use the SNAPSHOT versions for a PR to dev
# All images that have changed in this PR will be built locally
#
# For a PR to master, all images will be built locally, without a -SNAPSHOT
# postfix

echo -e "travis_fold:start:docker-compose"
docker-compose up -d
echo -e "travis_fold:end:docker-compose"
