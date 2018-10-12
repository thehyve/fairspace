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
sed -i -e "s/tag: RELEASEVERSION/tag: $VERSION/" charts/${APPNAME}/values.yaml
sed -i -e "s/repository: .*/repository: $DOCKER_REPO\/fairspace\/$APPNAME/" charts/${APPNAME}/values.yaml
