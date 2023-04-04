#!/bin/bash

# shellcheck disable=SC1090
source "$BUILD_SCRIPTS_DIR/helm/install_helm.sh"

if [[ $SHOULD_RELEASE ]]; then
  "$BUILD_SCRIPTS_DIR/login-provider.sh"

  echo "Adding helm repositories ..."
  source "$BUILD_SCRIPTS_DIR/helm/add_repos.sh"

  if [[ $SHOULD_DEPLOY = "true" ]]; then
    source "$BUILD_SCRIPTS_DIR/k8s/ics_kubectl.sh"
  fi

fi
