const PermissionsApi = require('../api/PermissionsApi');

module.exports = configuration =>
    configuration.auth.enabled ?
        new PermissionsApi(configuration.urls.collections) :
        { retrieveAccess: () => Promise.resolve('Manage') }
