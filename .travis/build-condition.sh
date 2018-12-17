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

# If the commit message contains '[full build]' then all
# directories should be built
if [[ $TRAVIS_COMMIT_MESSAGE == *"[full build]"* ]]; then
    exit 0
fi

# When doing a real release (on the release branch) we have to
# build all artifacts, as there have never been other builds for this
# particular version
if [[ "$TRAVIS_BRANCH" = "$RELEASE_BRANCH" ]]; then
    exit 0
fi

# Check whether the given project directory has changes. If so, the script (grep) will
# return 0. If not, grep will return a non-zero exit code
git diff --name-only $1 | sort -u | uniq | grep ^$2 > /dev/null
