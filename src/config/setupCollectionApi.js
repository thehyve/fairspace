const CollectionApi = require('../api/CollectionApi');

module.exports = configuration =>
    configuration.auth.enabled ?
        new CollectionApi(configuration.urls.collections) :
        { retrieveAccess: () => Promise.resolve('Manage') }
