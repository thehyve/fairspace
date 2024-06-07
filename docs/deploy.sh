#!/usr/bin/env bash

cd ..
git clone "https://${CI_SERVICE_ACCOUNT_USER}:${CI_SERVICE_ACCOUNT_PASSWORD}@github.com/${DOCUMENTATION_REPO}" fairspace-docs
export DOCS_DIR=$(pwd)/fairspace-docs

cp -r ./fairspace/docs/build/* "${DOCS_DIR}/"

pushd "${DOCS_DIR}"
if [ ! "$(git status -s)" == "" ]; then
  echo "Committing changes to ${DOCUMENTATION_REPO} ..."
  git add .
  git commit -a -m "Update from the documentation branch of ${TRAVIS_REPO_SLUG}."
  git push "https://${GITHUB_USERNAME}:${GITHUB_PASSWORD}@github.com/${DOCUMENTATION_REPO}" main
else
  echo "Documentation unchanged."
fi
popd
