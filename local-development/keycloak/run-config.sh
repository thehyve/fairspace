#!/bin/sh

SERVER=http://keycloak:8080/auth
USER=keycloak
REALM=test
./wait-for-server-to-respond.sh $SERVER
./setup-keycloak-hyperspace.sh $SERVER $USER $REALM
./setup-keycloak-workspace.sh $SERVER $USER $REALM ws /config/keycloak/redirect.urls
