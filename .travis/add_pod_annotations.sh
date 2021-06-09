#!/bin/bash
#
# This script will add a pod annotations for each project that has
# been built to ensure
# that the pod will be recreated for new SNAPSHOT images
#
# Required env variables:
#   $APPNAME
#   $COMMIT_ID
#
DIR=$(dirname $0)

# If we have no changes at all in any of the projects, we can skip
# pod annotations
if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE projects/; then
    # Remove empty pod annotations
    sed -i -e "s/podAnnotations: {}//" charts/fairspace/values.yaml

    # Add a pod annotation in the values.yaml file
    echo -e "\npodAnnotations:" >> charts/fairspace/values.yaml
    echo -e "  fairspace:\n    commit: \"$COMMIT_ID\"\n" >> charts/fairspace/values.yaml

    echo "Changes in $project_name project detected, fairspace pod will be restarted."
else
    echo "No changes found in projects since the last build."
fi
