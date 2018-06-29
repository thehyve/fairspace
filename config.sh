#!/bin/bash

set -e

read -p 'Workspace name:' WSNAME
echo "jupyterhub.proxy.secretToken: $(openssl rand -hex 32)" > $WSNAME-config.yaml
read -n 1 -p "Use Ingress (y/n)? " answer
echo
case ${answer:0:1} in
    y|Y )
        echo 'jupyterhub.hub.ingress.enabled: true' >> $WSNAME-config.yaml
        read -p 'Hostname: ' HOSTNAME
        echo "jupyterhub.hub.ingress.hosts: ['$HOSTNAME']" >> $WSNAME-config.yaml
    ;;
    * )
    ;;
esac
