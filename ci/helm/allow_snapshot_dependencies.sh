#!/bin/bash
#
# Required env variables:
#   $APPNAME
#

# Update the version number in the requirements list to allow snapshots
sed -i -e "s/version: v0.x.x/version: v0.x.x-SNAPSHOT/" charts/${APPNAME}/requirements.yaml
