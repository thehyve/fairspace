const KeycloakAdminClient = require('keycloak-admin').default;

const createKeycloakAdminClient = (config) => {
    const client = new KeycloakAdminClient({baseUrl: `${config.urls.keycloak}/auth`, realmName: 'master'});
    return client.auth({
        grantType: 'password',
        username: process.env.FAIRSPACE_SERVICE_ACCOUNT_USERNAME,
        password: process.env.FAIRSPACE_SERVICE_ACCOUNT_PASSWORD,
        clientId: 'admin-cli',
    })
        .then(() => {
            client.realmName = config.keycloak.realm;
            return client;
        })
        .catch(e => {
            console.error("Error establishing admin client connection", e);
            return Promise.reject(e);
        });
};

const addRoles = (keycloakAdminClient, compositeRole, associatedRoles) => Promise.all(associatedRoles.map(name => keycloakAdminClient.roles.findOneByName({name})))
    .then(roles => keycloakAdminClient.roles.makeUpdateRequest({
        method: 'POST',
        path: `/roles/${compositeRole}/composites`,
    })({}, roles));

const createWorkspaceRoles = (config, workspaceId) => createKeycloakAdminClient(config)
    .then(keycloakAdminClient => Promise.all(['user', 'coordinator', 'write', 'datasteward'].map(roleType => keycloakAdminClient.roles.create({name: `workspace-${workspaceId}-${roleType}`})
        .then(({roleName}) => roleName)))
        .then(([user, coordinator, write, datasteward]) => Promise.all([
            addRoles(keycloakAdminClient, write, [user]),
            addRoles(keycloakAdminClient, datasteward, [user]),
            addRoles(keycloakAdminClient, coordinator, [write, datasteward]),
            addRoles(keycloakAdminClient, 'organisation-admin', [coordinator])
        ])));

const grantRole = (config, workspaceId, userId, roleType) => createKeycloakAdminClient(config)
    .then(client => client.roles.findOneByName({name: `workspace-${workspaceId}-${roleType}`})
        .then(role => client.users.addRealmRoleMappings({id: userId, roles: [role]})));

const revokeRole = (config, workspaceId, userId, roleType) => createKeycloakAdminClient(config)
    .then(client => client.roles.findOneByName({name: `workspace-${workspaceId}-${roleType}`})
        .then(role => client.users.delRealmRoleMappings({id: userId, roles: [role]})));

const listUsers = (config, workspaceId) => createKeycloakAdminClient(config)
    .then(client => Promise.all(['user', 'coordinator', 'write', 'datasteward'].map(roleType => client.roles.findUsersWithRole({name: `workspace-${workspaceId}-${roleType}`})
        .then(users => ({roleType, users}))))
        .then(userRoleMappings => {
            const allUsers = [];
            userRoleMappings.forEach(({roleType, users}) => users.filter(user => user.enabled)
                .forEach(user => {
                    const existing = allUsers.find(u => u.id === user.id);
                    if (existing) {
                        existing.roleTypes.push(roleType);
                    } else {
                        allUsers.push({id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username, roleTypes: [roleType]});
                    }
                }));
            return allUsers;
        }));


module.exports = {createWorkspaceRoles, grantRole, revokeRole, listUsers};
