const request = require('superagent');
const expect = require('expect.js');
const config = require('./config');
const fixture = require('./fixture');

const createCollection = async (sessionCookie, uniqueId) => {
    const collection = fixture.asJSON('empty-collection.json');
    const collectionName = collection.name + ' ' + uniqueId;

    // Create a new collection
    const collectionId = await request
        .post(config.workspaceUri + '/api/collections')
        .set('Content-type', 'application/json')
        .set('Cookie', sessionCookie)
        .send({...collection, name: collectionName})
        .then(response => {
            expect(response.status).to.equal(201);
            const url = response.headers['location'];
            return  url.substr(url.lastIndexOf('/') + 1);
        });

    return request
        .get(config.workspaceUri + '/api/collections/' + collectionId)
        .set('Cookie', sessionCookie)
        .then(response => {
            expect(response.status).to.equal(200);

            return response.body;
        });
}

const removeAllCollections = (sessionCookie) =>
    // Retrieve a list of collections
    request.get(config.workspaceUri + '/api/collections')
        .set('Cookie', sessionCookie)
        .then(data => {
            expect(data.status).to.equal(200);

            // Delete very one of them
            return Promise.all(data.body.map(
                collection => request
                    .delete(config.workspaceUri + '/api/collections/' +  collection.id)
                    .set('Cookie', sessionCookie)
            ));
        });


module.exports = {
    createCollection: createCollection,
    removeAllCollections: removeAllCollections
};
