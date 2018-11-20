#!/bin/bash
#
# This script will check whether a certain directory contains changes
# and thus should be built.
#
# This check can be overridden by adding [full build] to the commit message
#
# Usage: build-condition.sh <commitrange> <path>
#

if [[ -z $1 ]]; then
    echo "Commit range cannot be empty"
    echo "Usage: build-condition.sh <commitrange> <path>"
    exit 1
fi

if [[ -z $2 ]]; then
    echo "Change path cannot be empty"
    echo "Usage: build-condition.sh <commitrange> <path>"
    exit 1
fi

if [[ $TRAVIS_COMMIT_MESSAGE == *"[full build]"* ]]; then
    # Commit message contains '[full build]' and all
    # directories should be built
    exit 0
fi

git diff --name-only $1 | sort -u | uniq | grep $2 > /dev/null
