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

# Specifies project name or "pod name":"project name"
# if project served by another project
PROJECTS=(saturn pluto pluto:mercury)

# If we have no changes at all in any of the projects, we can skip
# pod annotations
if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE projects/; then
    # Remove empty pod annotations
    sed -i -e "s/podAnnotations: {}//" charts/fairspace/values.yaml

    # Add a pod annotation in the values.yaml file
    echo -e "\npodAnnotations:" >> charts/fairspace/values.yaml
    echo -e "  fairspace:\n    commit: \"$COMMIT_ID\"\n" >> charts/fairspace/values.yaml

    for project in ${PROJECTS[*]}
    do
        IFS=':'; arr=($project); unset IFS;
        pod_name=${arr[0]}
        if [ -z "${arr[1]}" ]; then project_name=${arr[0]}; else project_name=${arr[1]}; fi

        if $DIR/build-condition.sh $TRAVIS_COMMIT_RANGE projects/$project_name; then
            echo "Changes in $project_name project detected, $pod_name pod will be restarted."
            echo -e "  ${pod_name}:\n    commit: \"$COMMIT_ID\"\n" >> charts/fairspace/values.yaml
        fi
    done
else
    echo "No changes found in projects since the last build."
fi
