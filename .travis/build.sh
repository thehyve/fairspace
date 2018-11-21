#!/bin/bash
DIR=$(dirname $0)
PROJECT=$1

# Set variables for use in build scripts
export APPNAME=$(basename $PROJECT)
export CONTAINER_NAME="${DOCKER_REPO}/${ORG}/${APPNAME}:${VERSION}"

if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT; then
    echo "Building $APPNAME...";
    cd $PROJECT

    echo -e "travis_fold:start:Building $PROJECT"
    source .travis/env.sh
    .travis/build.sh || exit 1
    echo -e "travis_fold:end:Building $PROJECT"

    if [[ $SHOULD_RELEASE ]]; then
      echo "Releasing artifact for $PROJECT"
      echo -e "travis_fold:start:Releasing $PROJECT"
      .travis/release.sh || exit 2
      echo -e "travis_fold:end:Releasing $PROJECT"
    fi

    cd ../..
else
    echo "No changes for $APPNAME";
fi
