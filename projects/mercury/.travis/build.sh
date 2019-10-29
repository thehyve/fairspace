#!/bin/bash

# Run vulnerability check on release to master
# It is done by yarn
if [[ "$TRAVIS_BRANCH" = "$RELEASE_BRANCH" ]]; then
  yarn audit

  # Only fail build if critical vulnerabilities are found
  # The number is defined by https://yarnpkg.com/lang/en/docs/cli/audit/
  if [ $? -ge 16 ]; then exit 2; fi
fi

# Actual build
$BUILD_SCRIPTS_DIR/yarn/tag.sh || exit 1
$BUILD_SCRIPTS_DIR/yarn/build.sh || exit 1
$BUILD_SCRIPTS_DIR/docker/build.sh
