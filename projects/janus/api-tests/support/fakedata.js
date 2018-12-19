const request = require('superagent');
const expect = require('expect.js');
const config = require('./config');
const fixture = require('./fixture');

const createCollection = async (authenticatedRequest, uniqueId) => {
    const collection = fixture.asJSON('empty-collection.json');
    const collectionName = collection.name + ' ' + uniqueId;

    // Create a new collection
    const collectionId = await authenticatedRequest('POST', config.workspaceUri + '/api/collections')
        .set('Content-type', 'application/json')
        .send({...collection, name: collectionName})
        .then(response => {
            expect(response.status).to.equal(201);
            const url = response.headers['location'];
            return  url.substr(url.lastIndexOf('/') + 1);
        });

    return authenticatedRequest('GET', config.workspaceUri + '/api/collections/' + collectionId)
        .then(response => {
            expect(response.status).to.equal(200);

            return response.body;
        });
}

const removeAllCollections = (authenticatedRequest) =>
    // Retrieve a list of collections
    authenticatedRequest('GET', config.workspaceUri + '/api/collections')
        .then(data => {
            expect(data.status).to.equal(200);

            // Delete very one of them
            return Promise.all(data.body.map(
                collection => authenticatedRequest('DELETE', config.workspaceUri + '/api/collections/' +  collection.id)
            ));
        });


module.exports = {
    createCollection: createCollection,
    removeAllCollections: removeAllCollections
};
