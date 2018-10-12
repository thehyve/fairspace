#!/bin/bash
#
# Required env variables:
#   $APPNAME
#   $VERSION
#
#   $GITHUB_USERNAME
#   $GITHUB_PASSWORD
#

# Commit the updated values and put a git tag
git add ./charts/$APPNAME/Chart.yaml ./charts/$APPNAME/values.yaml ./build.gradle
git commit -m "Release version $VERSION [skip ci]" --allow-empty # if first release then no verion update is performed
git tag -fa v$VERSION -m "Release version $VERSION [skip ci]"
git remote add origin-authenticated $(git remote get-url origin | sed s/github.com/$GITHUB_USERNAME:$GITHUB_PASSWORD@github.com/i)
git push origin-authenticated v$VERSION
