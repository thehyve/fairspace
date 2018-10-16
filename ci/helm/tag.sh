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
sed -i -e "s/version: 0.0.0-RELEASEVERSION/version: $VERSION/" charts/${APPNAME}/Chart.yaml
sed -i -e "s/version: 0.0.0-RELEASEVERSION/version: $VERSION/" charts/${APPNAME}/values.yaml
