const request = require('superagent');
const expect = require('expect.js');

const auth = require('./support/auth');
const fixture = require('./support/fixture');
const metadata = require('./support/metadata');
const fakedata = require('./support/fakedata');
const config = require('./support/config');

describe('Collections api', () => {
    let authenticatedRequest, uniqueId;

    before(async () => {
        const sessionCookie = await auth.retrieveSessionCookie();
        authenticatedRequest = auth.authenticatedRequest(sessionCookie);
        uniqueId = Math.round(100000 + (Math.random() * 900000));

        // Remove old collections
        await fakedata.removeAllCollections(authenticatedRequest);
    });

    describe('Collection lifecycle', () => {
        it('should allow for the addition and deletion of collections', async () => {
            const collection = fixture.asJSON('empty-collection.json');
            const collectionName = collection.name + ' ' + uniqueId;

            // Create a new collection
            const creationResponse = await authenticatedRequest('POST', config.workspaceUri + '/api/collections')
                .set('Content-type', 'application/json')
                .send({...collection, name: collectionName});

            // Verify the response
            expect(creationResponse.status).to.equal(201);
            expect(creationResponse.headers['location']).to.be.ok();

            const uri = creationResponse.headers['location'];
            const collectionId = uri.substring(uri.lastIndexOf('/') + 1);

            // Retrieve collection details
            const retrievalResponse = await authenticatedRequest('GET', config.workspaceUri + '/api/collections/' + collectionId);

            // Verify the item is stored
            expect(retrievalResponse.status).to.equal(200);
            expect(retrievalResponse.body.name).to.equal(collectionName)
            expect(retrievalResponse.body.access).to.equal('Manage')

            // Delete the item again
            const deletionResponse = await authenticatedRequest('DELETE', config.workspaceUri + '/api/collections/' + collectionId);

            // Verify the response
            expect(deletionResponse.status).to.equal(200);

            //  Make sure the item can not be retrieved anymore
            const additionalRetrieval = await authenticatedRequest('GET', config.workspaceUri + '/api/collections/' + collectionId)
                .ok(response => response.status < 500);

            expect(additionalRetrieval.status).to.equal(404);
        })
    });

    describe('Collection metadata', () => {
        before(async () => {
            collection = await fakedata.createCollection(authenticatedRequest, 'metadata ' + uniqueId);
        });

        it('should store collection metadata on new collection creation', async () => {
            // Verify that the collection itself has metadata describing this directory
            const jsonld = await metadata.getMetadataForSubject(collection.uri, authenticatedRequest);
            expect(jsonld).to.be.ok();

            const label = metadata.getPropertyValue(jsonld, "http://www.w3.org/2000/01/rdf-schema#label");
            expect(label.length).to.equal(1);
            expect(label[0]).to.equal(collection.name)
        });

        it('should update collection metadata on collection name change', async () => {
            // Update collection name
            const response = await authenticatedRequest('PATCH', config.workspaceUri + '/api/collections/' + collection.id)
                .send({ name: 'new name ' + uniqueId });

            expect(response.status).to.equal(200);

            // Verify that the collection itself has metadata describing this directory
            const jsonld = await metadata.getMetadataForSubject(collection.uri, authenticatedRequest);
            expect(jsonld).to.be.ok();

            const label = metadata.getPropertyValue(jsonld, "http://www.w3.org/2000/01/rdf-schema#label");
            expect(label.length).to.equal(1);
            expect(label[0]).to.equal('new name ' + uniqueId)

        })
    });

    describe('Collection file storage', () => {
        it('should create collection storage location when a new collection is created', async () => {
            let storageBaseUri, response;
            collection = await fakedata.createCollection(authenticatedRequest, 'filestorage ' + uniqueId);

            // Check location on disk
            storageBaseUri = config.storageUri + '/api/storage/webdav/' + collection.location
            response = await authenticatedRequest('PROPFIND', storageBaseUri);

            expect(response.status).to.be.within(200, 299);
        })

        it('should update collection storage location on collection name change', async () => {
            let storageBaseUri, response;
            collection = await fakedata.createCollection(authenticatedRequest, 'file ' + uniqueId);

            // Update collection name
            response = await authenticatedRequest('PATCH', config.workspaceUri + '/api/collections/' + collection.id)
                .send({ name: 'new file ' + uniqueId });
            expect(response.status).to.equal(200);

            // Check the collection
            const updatedCollection = await authenticatedRequest('GET', config.workspaceUri + '/api/collections/' + collection.id)
                .then(response => {
                    expect(response.status).to.equal(200);

                    return response.body;
                });

            expect(updatedCollection.location.indexOf('new') > -1).to.be.ok();

            // Check location on disk
            storageBaseUri = config.storageUri + '/api/storage/webdav/' + updatedCollection.location
            response = await authenticatedRequest('PROPFIND', storageBaseUri);

            expect(response.status).to.be.within(200, 299);

            // Old location has been removed
            storageBaseUri = config.storageUri + '/api/storage/webdav/' + collection.location
            response = await authenticatedRequest('PROPFIND', storageBaseUri)
                .ok(response => response.status < 500);

            expect(response.status).to.be.within(400, 499);
        })

    })

});
