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
sed -i -e "s/version = 'RELEASEVERSION'/version = '$VERSION'/" build.gradle
