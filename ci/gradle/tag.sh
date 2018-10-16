#!/bin/bash
#
# Required env variables:
#   $BUILD_GRADLE_FILE
#   $VERSION

# Update version number in build.gradle
#
sed -i -e "s/version = 'RELEASEVERSION'/version = '$VERSION'/" $BUILD_GRADLE_FILE
