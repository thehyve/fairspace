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

const ROLE_TYPES = ['user', 'write', 'datasteward', 'coordinator'];

const workspaceRole = (workspaceId, roleType) => ({name: `workspace-${workspaceId}-${roleType}`});

const createWorkspaceRoles = (config, workspaceId) => createKeycloakAdminClient(config)
    .then(keycloakAdminClient => Promise.all(ROLE_TYPES.map(roleType => keycloakAdminClient.roles.create(workspaceRole(workspaceId, roleType))
        .then(({roleName}) => roleName)))
        .then(([user, write, datasteward, coordinator]) => Promise.all([
            addRoles(keycloakAdminClient, write, [user]),
            addRoles(keycloakAdminClient, datasteward, [user]),
            addRoles(keycloakAdminClient, coordinator, [write, datasteward]),
            addRoles(keycloakAdminClient, 'organisation-admin', [coordinator])
        ])));

const setRole = (config, workspaceId, userId, roleType) => createKeycloakAdminClient(config)
    .then(client => Promise.all(ROLE_TYPES.map(rt => client.roles.findOneByName(workspaceRole(workspaceId, rt))
        .then(role => client.users.delRealmRoleMappings({id: userId, roles: [role]}))))
        .then(() => {
            if (roleType !== 'none') {
                client.roles.findOneByName(workspaceRole(workspaceId, roleType))
                    .then(role => client.users.addRealmRoleMappings({id: userId, roles: [role]}));
            }
        }));

const username = (user) => (((user.firstName || '') + ' ' + (user.lastName || '')).trim() || user.username);

const listUsers = (config, workspaceId) => createKeycloakAdminClient(config)
    .then(client => client.users.find()
        .then(allUsers => allUsers.filter(user => user.enabled))
        .then(allUsers => allUsers.map(user => ({
            id: user.id,
            name: username(user),
            email: user.email,
            username: user.username,
            roleTypes: []
        })))
        .then(allUsers => Promise.all(ROLE_TYPES.map(roleType => client.roles.findUsersWithRole(workspaceRole(workspaceId, roleType))
            .then(users => ({roleType, users: users.filter(user => user.enabled)}))))
            .then(roleMappings => roleMappings.forEach(({roleType, users}) => users.forEach(user => {
                allUsers.find(u => u.id === user.id).role = roleType;
            })))
            .then(() => allUsers)));


module.exports = {createWorkspaceRoles, setRole, listUsers};
