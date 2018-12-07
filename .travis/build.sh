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
  COMMIT_TRIGGER=$TRAVIS_BRANCH
else
  COMMIT_TRIGGER=$TRAVIS_COMMIT_RANGE
fi

# Only execute build if something has changed within the project
if $DIR/build-condition.sh $COMMIT_TRIGGER $PROJECT; then
    echo "Building $APPNAME...";
    cd $PROJECT

    echo -e "travis_fold:start:Building-$APPNAME"
    source .travis/env.sh
    .travis/build.sh
    rc=$?
    echo -e "travis_fold:end:Building-$APPNAME"

    # If the build failed, do not bother releasing
    if [[ $rc != 0 ]]; then
        exit $rc
    fi

    if [[ $SHOULD_RELEASE ]]; then
      echo "Releasing artifact for $APPNAME"
      echo -e "travis_fold:start:Releasing-$APPNAME"
      .travis/release.sh
      rc=$?
      echo -e "travis_fold:end:Releasing-$APPNAME"

      # If the release failed, return a non-zero exit status
      if [[ $rc != 0 ]]; then
          exit $rc
      fi

    fi

    cd ../..
else
    echo "No changes for $APPNAME";
fi
