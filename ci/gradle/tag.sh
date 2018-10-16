#!/bin/bash
#
# Required env variables:
#   $APPNAME
#   $VERSION
#
#   $GITHUB_USERNAME
#   $GITHUB_PASSWORD
#

# Update version number and repository
#
# This script has been adapted to use a nonstandard location for the build.gradle file location.
sed -i -e "s/version = 'RELEASEVERSION'/version = '$VERSION'/" app/build.gradle
