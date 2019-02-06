#!/bin/bash

# shellcheck disable=SC1090
source "$BUILD_SCRIPTS_DIR/helm/install_helm.sh"

if [[ $SHOULD_RELEASE ]]; then
  if [ "$DEPLOY_PLATFORM" = "GCP" ]
  then echo "Installing Google Cloud SDK ..."
       "$BUILD_SCRIPTS_DIR/gcp/install.sh"
       echo "Configuring Google Cloud SDK ..."
       "$BUILD_SCRIPTS_DIR/gcp/login.sh"
  else echo "Installing Azure CLI ..."
       "$BUILD_SCRIPTS_DIR/az/install.sh"
       echo "Configuring Azure CLI ..."
       "$BUILD_SCRIPTS_DIR/az/login.sh"
  fi

  "$BUILD_SCRIPTS_DIR/k8s/install_kubectl.sh"
  export PATH="$HOME/downloads/v${KUBECTL_VERSION}:$PATH"
  "$BUILD_SCRIPTS_DIR/k8s/config_kubectl.sh"
  "$BUILD_SCRIPTS_DIR/k8s/switch_context.sh"

fi
