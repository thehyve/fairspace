#!/usr/bin/env bash

git clone "https://${GITHUB_USERNAME}:${GITHUB_PASSWORD}@github.com/${DOCUMENTATION_REPO}" fairspace-docs
export DOCS_DIR=$(pwd)/fairspace-docs

docs/build.sh || {
  echo "Failed to build documentation"
  exit 1
}

cp -r docs/build/* "${DOCS_DIR}/"

pushd "${DOCS_DIR}"
if [ ! "$(git status -s)" == "" ]; then
  echo "Committing changes to ${DOCUMENTATION_REPO} ..."
  git commit -a -m "Update from the documentation branch of ${TRAVIS_REPO_SLUG}."
  git push "https://${GITHUB_USERNAME}:${GITHUB_PASSWORD}@github.com/${DOCUMENTATION_REPO}" main
else
  echo "Documentation unchanged."
fi
popd
