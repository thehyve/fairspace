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
PROJECTS=(callisto ceres mercury neptune pluto titan)

# If we have no changes at all in any of the projects, we can skip
# pod annotations
if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE projects/; then
    # Remove empty pod annotations
    sed -i -e "s/podAnnotations: {}//" charts/workspace/values.yaml

    # Add a pod annotation in the values.yaml file
    echo -e "\npodAnnotations:" >> charts/workspace/values.yaml
    echo -e "  workspace:\n    commit: \"$COMMIT_ID\"\n"

    for project in ${PROJECTS[*]}
    do
        if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE projects/$project; then
            echo -e "  ${project}:\n    commit: \"$COMMIT_ID\"\n" >> charts/workspace/values.yaml
        fi
    done
fi
