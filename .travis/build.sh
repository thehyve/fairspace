#!/bin/bash
DIR=$(dirname $0)

for PROJECT in projects/*; do
  export APPNAME=$(basename $PROJECT)
  if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT; then
    echo "Building $APPNAME...";
    cd $PROJECT

    source .travis/env.sh;
    .travis/build.sh;

    if [[ $SHOULD_RELEASE ]]; then
      echo "Releasing artifact for $PROJECT"
      .travis/release.sh;
    fi

    cd ../..
  else
    echo "No changes for $APPNAME";
  fi
done
