#!/bin/bash

set -e

read -p 'Workspace name:' WSNAME


helm repo add chartmuseum https://chartmuseum.jx.test.fairdev.app/
helm repo update
helm install --name=workspace chartmuseum/workspace --namespace=ws-$WSNAME -f $WSNAME-config.yaml
