#!/bin/sh

SERVER=http://keycloak:8080/auth
USER=e2e
REALM=e2e
./wait-for-server-to-respond.sh $SERVER
./setup-keycloak-hyperspace.sh $SERVER $USER $REALM
./setup-keycloak-workspace.sh $SERVER $USER $REALM e2e /pr/config/keycloak/redirect.urls
