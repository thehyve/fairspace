#!/bin/bash
#
# Required env variables:
#   $VERSION
#

# Update version number and repository
sed -i -e "s/\"version\": \"0.0.0-RELEASEVERSION\"/\"version\": \"$VERSION\"/" package.json
