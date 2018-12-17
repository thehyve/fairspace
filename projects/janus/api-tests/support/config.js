module.exports = {
  workspaceUri: process.env.WORKSPACE_URL || "https://workspace.ci.fairway.app",
  storageUri: process.env.STORAGE_URL || "https://storage.workspace.ci.fairway.app",
  keycloak: {
      uri: process.env.CYPRESS_KEYCLOAK_URL || "https://keycloak.hyperspace.ci.fairway.app",
      realm: process.env.CYPRESS_KEYCLOAK_REALM || "ci",
      publicClientId: process.env.CYPRESS_KEYCLOAK_PUBLIC_CLIENT_ID || "workspace-ci-public"
  },
  username: process.env.CYPRESS_USERNAME || "test-workspace-ci",
  password: process.env.CYPRESS_PASSWORD || "fairspace123",
  secondUsername: process.env.CYPRESS_SECOND_USER || "test2-workspace-ci",
  timeouts: {
      metadataPropagation: process.env.METADATA_PROPAGATION_TIME || 500,
      requestTimeout: process.env.REQUEST_TIMEOUT || 1000
  }
}
