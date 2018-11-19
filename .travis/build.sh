#!/bin/bash
DIR=$(dirname $0)
for PROJECT in $DIR/../projects/*; do
  if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE $PROJECT; then
    $DIR/projects/$PROJECT/.travis/build.sh;

    if [[ $SHOULD_RELEASE ]]; then
      echo "Releasing artifact for $PROJECT"
      $DIR/projects/$PROJECT/.travis/release.sh;
    fi
  else
    echo "No changes for $PROJECT";
  fi
done
