#!/bin/bash

source $BUILD_SCRIPTS_DIR/helm/install_helm.sh
export PATH="$HOME/downloads/v${KUBECTL_VERSION}:$PATH"
