cat /tmp/realm-template.json | \
  sed "s|\${KEYCLOAK_REALM}|${KEYCLOAK_REALM}|" | \
  sed "s|\${WORKSPACE_CLIENT_ID}|${WORKSPACE_CLIENT_ID}|" | \
  sed "s|\${WORKSPACE_URL}|${WORKSPACE_URL}|" | \
  sed "s|\${WORKSPACE_DEBUG_URL}|${WORKSPACE_DEBUG_URL}|" \
  > /tmp/realm-export.json
