#!/bin/bash
DIR=$(dirname $0)
PROJECT=$1

# Set variables for use in build scripts
export APPNAME=$(basename $PROJECT)
export CONTAINER_NAME="${DOCKER_REPO}/${ORG}/${APPNAME}:${VERSION}"

if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT; then
    echo "Building $APPNAME...";
    cd $PROJECT

    source .travis/env.sh
    .travis/build.sh || exit 1

    if [[ $SHOULD_RELEASE ]]; then
      echo "Releasing artifact for $PROJECT"
      .travis/release.sh || exit 2
    fi

    cd ../..
else
    echo "No changes for $APPNAME";
fi
