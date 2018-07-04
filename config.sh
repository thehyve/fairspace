#!/bin/bash

set -e

read -p 'Workspace name:' WSNAME
echo "jupyterhub.proxy.secretToken: $(openssl rand -hex 32)" > $WSNAME-config.yaml

read -n 1 -p "Use Ingress (y/n)? " answer
echo
case ${answer:0:1} in
    y|Y )
        echo 'workspace.ingress.enabled: true' >> $WSNAME-config.yaml

        read -p 'Workspace domain: ' DOMAIN
        echo "workspace.ingress.domain: '$DOMAIN'" >> $WSNAME-config.yaml

        read -p 'Hyperspace domain: ' HYPERSPACE_DOMAIN
        echo "hyperspace.domain: '$HYPERSPACE_DOMAIN'" >> $WSNAME-config.yaml

    ;;
    * )
    ;;
esac
