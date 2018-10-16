#!/bin/bash
#
# Required env variables:
#   $APPNAME
#   $VERSION
#
#   $GITHUB_USERNAME
#   $GITHUB_PASSWORD
#

# Package chart
helm package charts/${APPNAME}

# Get Chart version number
CHARTVERSION=$(sed -n 's/^version: //p' charts/${APPNAME}/Chart.yaml)
echo Chart version number is $CHARTVERSION

# Add chart to helm repo
git clone https://github.com/fairspace/helm-repo helm-repo
mv "${APPNAME}-${CHARTVERSION}.tgz" helm-repo

cd helm-repo
helm repo index --merge index.yaml .
git add .
git commit -m "Add chart for $APPNAME v$VERSION" && \
git remote add origin-authenticated $(git remote get-url origin | sed s/github.com/$GITHUB_USERNAME:$GITHUB_PASSWORD@github.com/i)
git push origin-authenticated master

# Cleanup
cd ..
rm -rf helm-repo
rm -rf $APPNAME*.tgz

