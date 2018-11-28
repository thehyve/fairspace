#!/bin/bash
DIR=$(dirname $0)
PROJECT=$1

# Set variables for use in build scripts
export APPNAME=$(basename $PROJECT)
export CONTAINER_NAME="${DOCKER_REPO}/${ORG}/${APPNAME}:${VERSION}"

# If we are building a PR, use the target branch as 'commit range'.
# As it is used with `git diff ...`, it will trigger all files that
# have updated in the complete pull request
if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then
  COMMIT_TRIGGER=$TRAVIS_COMMIT_RANGE
else
  COMMIT_TRIGGER=$TRAVIS_BRANCH
fi

# Only execute build if something has changed within the project
if $DIR/build-condition.sh $COMMIT_TRIGGER $PROJECT; then
    echo "Building $APPNAME...";
    cd $PROJECT

    echo -e "travis_fold:start:Building-$PROJECT"
    source .travis/env.sh
    .travis/build.sh || exit 1
    echo -e "travis_fold:end:Building-$PROJECT"

    if [[ $SHOULD_RELEASE ]]; then
      echo "Releasing artifact for $PROJECT"
      echo -e "travis_fold:start:Releasing-$PROJECT"
      .travis/release.sh || exit 2
      echo -e "travis_fold:end:Releasing-$PROJECT"
    fi

    cd ../..
else
    echo "No changes for $APPNAME";
fi
