#!/bin/bash
#
# Required env variables:
#   $HELM_VERSION

mkdir -p $HOME/downloads
wget --no-clobber "https://storage.googleapis.com/kubernetes-helm/helm-v${HELM_VERSION}-linux-amd64.tar.gz" -O $HOME/downloads/helm-v${HELM_VERSION}.tar.gz
tar xvfz $HOME/downloads/helm-v${HELM_VERSION}.tar.gz

