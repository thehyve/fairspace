#!/bin/sh

./wait-for-server-to-respond.sh http://keycloak:8080/auth
./setup-keycloak-hyperspace.sh "http://keycloak:8080/auth" "e2e" "e2e"
./setup-keycloak-workspace.sh "http://keycloak:8080/auth" "e2e" "e2e" "e2e" "/pr/config/keycloak/redirect.urls" "false"
