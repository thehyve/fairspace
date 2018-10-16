#!/bin/bash

mkdir -p $HOME/downloads/v${KUBECTL_VERSION}
wget --no-clobber "https://storage.googleapis.com/kubernetes-release/release/v${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -O $HOME/downloads/v${KUBECTL_VERSION}/kubectl
chmod +x $HOME/downloads/v${KUBECTL_VERSION}/kubectl
