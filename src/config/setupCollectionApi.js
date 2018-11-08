const CollectionApi = require('../api/CollectionApi');

module.exports = configuration =>
    configuration.auth.enabled ?
        new CollectionApi(configuration.urls.collections) :
        {
            retrieveAccess: () => Promise.resolve('Manage'),
            retrieveCollection: () => Promise.resolve({id: 5, type: 'LOCAL', location: 'test-collection-5', name: 'Test collection', access: 'Manage', uri: 'http://fairspace.io/collection/5'})
        }
