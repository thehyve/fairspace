#!/bin/sh
set -e

CERTS_PATH="/opt/extra_certs.pem"

[[ -f "${CERTS_PATH}" ]] && \
{ keytool -delete -alias certificate-alias -keystore "${JAVA_HOME}/lib/security/cacerts" -storepass changeit || true; \
  keytool -import -trustcacerts -file "${CERTS_PATH}" -alias certificate-alias -keystore "${JAVA_HOME}/lib/security/cacerts" -storepass changeit -noprompt; }


/opt/pluto-boot-*/bin/pluto