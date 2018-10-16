#!/bin/bash

ENVIRONMENT=${1:-ci}

helm repo add fairspace https://fairspace.github.io/helm-repo
helm repo update
helm upgrade --install ${APPNAME}-${ENVIRONMENT} fairspace/${APPNAME} --namespace=${APPNAME}-${ENVIRONMENT} --version $VERSION -f ./ci/config/${ENVIRONMENT}-values.yaml
