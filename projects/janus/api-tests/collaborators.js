const expect = require('expect.js');

const auth = require('./support/auth');
const fakedata = require('./support/fakedata');
const fixture = require('./support/fixture');
const config = require('./support/config');

const storageBaseUri = config.storageUri + '/api/storage/webdav/';
const collectionsUri = config.workspaceUri + '/api/collections';

describe('Collaborators api', function() {
    let authenticatedRequest, uniqueId, collection, normalUser, secondUser;

    before(async () => {
        const sessionCookie = await auth.retrieveSessionCookie();
        authenticatedRequest = auth.authenticatedRequest(sessionCookie);
        uniqueId = Math.round(100000 + (Math.random() * 900000));

        // Remove old collections
        await fakedata.removeAllCollections(authenticatedRequest);

        // Create a collection
        collection = await fakedata.createCollection(authenticatedRequest, uniqueId);

        // Retrieve workspace users
        const users = await authenticatedRequest('GET', config.workspaceUri + '/api/workspace/users')
            .then(response => response.body);

        // Store the user properties
        normalUser = users.find(user => user.username === config.username);
        secondUser = users.find(user => user.username === config.secondUsername);
    });

    describe('CRUD operations', () => {
        it('should allow for the addition and modification of collaborators', async () => {
            const collaborator = {
                subject: secondUser.id,
                collection: collection.id,
                access: 'Write'
            };

            // Add a new collaborator
            const creationResponse = await authenticatedRequest('PUT', config.workspaceUri + '/api/collections/permissions')
                .set('Content-type', 'application/json')
                .send(collaborator);

            expect(creationResponse.status).to.equal(200);

            // Retrieve the collaborators
            const retrievalResponse = await authenticatedRequest('GET', config.workspaceUri + '/api/collections/' + collection.id + '/permissions')
                .set('Accept', 'application/json');

            expect(retrievalResponse.status).to.equal(200);
            expect(retrievalResponse.body.find(
                c => c.subject == collaborator.subject && c.access == collaborator.access
            )).to.be.ok();

            // Remove the collaborator
            const deletionResponse = await authenticatedRequest('PUT', config.workspaceUri + '/api/collections/permissions')
                .set('Content-type', 'application/json')
                .send({...collaborator, access: 'None'});

            expect(deletionResponse.status).to.equal(200);

            // Retrieve the collaborators
            const secondRetrievalResponse = await authenticatedRequest('GET', config.workspaceUri + '/api/collections/' + collection.id + '/permissions')
                .set('Accept', 'application/json');

            expect(secondRetrievalResponse.status).to.equal(200);
            expect(secondRetrievalResponse.body.find(
                c => c.subject == collaborator.subject && c.access == collaborator.access
            )).not.to.be.ok();
        })
    });

    describe('Permission setting effects', () => {
        let permissionCollection, otherUserSessionCookie;
        let otherUserRequest;

        before(async () => {
            permissionCollection = await fakedata.createCollection(authenticatedRequest, uniqueId + 1);
            otherUserSessionCookie = await auth.retrieveSessionCookie(config.secondUsername);
            otherUserRequest = auth.authenticatedRequest(otherUserSessionCookie);
        });

        describe('No permissions', () => {
            it('should not include the collection in the list', async () => {
                const response = await otherUserRequest('GET', config.workspaceUri + '/api/collections');

                expect(response.status).to.equal(200);
                expect(response.body.find(
                    c => c.id === permissionCollection.id
                )).not.to.be.ok();
            });

            it('should not allow listing files', async () => {
                const response = await otherUserRequest('PROPFIND', storageBaseUri + permissionCollection.location)
                    .ok(c => c.status < 500);

                expect(response.status).to.equal(401);
            });
            it('should not allow adding files', async () => {
                const data = fixture.load('myfile.txt');
                const response = await otherUserRequest('PUT', storageBaseUri + permissionCollection.location + '/file.txt')
                    .set('Content-length', data.length)
                    .ok(c => c.status < 500)
                    .send(data);

                expect(response.status).to.equal(401);
            });
            it('should not allow adding directories', async () => {
                const response = await otherUserRequest('MKCOL', storageBaseUri + permissionCollection.location + '/dir')
                    .ok(c => c.status < 500);

                expect(response.status).to.equal(401);
            });
            it('should not include the collection directory in the root directory listing', async () => {
                const response = await otherUserRequest('PROPFIND', storageBaseUri);
                expect(response.status).to.equal(207);

                // The webdav utility does return urls, but it uses the http scheme on it.
                // For that reason, we expect the url to be in the response, but without scheme
                const expectedUri = storageBaseUri.substring(5) + permissionCollection.location
                expect(response.body.toString()).not.to.contain(expectedUri);
            });
            it('should not allow changing permissions', async () => {
                const collaborator = {
                    subject: normalUser.id,
                    collection: permissionCollection.id,
                    access: 'Write'
                }

                // Add a new collaborator
                const creationResponse = await otherUserRequest('PUT', config.workspaceUri + '/api/collections/permissions')
                    .set('Content-type', 'application/json')
                    .ok(c => c.status < 500)
                    .send(collaborator);

                expect(creationResponse.status).to.equal(401);
            });
        })

        describe('Manage permissions', () => {
            it('should include the collection in the list', async () => {
                const response = await authenticatedRequest('GET', config.workspaceUri + '/api/collections');

                expect(response.status).to.equal(200);
                expect(response.body.find(
                    c => c.id === permissionCollection.id
                )).to.be.ok();
            });

            it('should allow listing files', async () => {
                const response = await authenticatedRequest('PROPFIND', storageBaseUri + permissionCollection.location);
                expect(response.status).to.equal(207);
            });
            it('should allow adding files', async () => {
                const data = fixture.load('myfile.txt');
                const response = await authenticatedRequest('PUT', storageBaseUri + permissionCollection.location + '/file.txt')
                    .set('Content-length', data.length)
                    .send(data);

                expect(response.status).to.equal(201);
            });
            it('should allow adding directories', async () => {
                const response = await authenticatedRequest('MKCOL', storageBaseUri + permissionCollection.location + '/dir');
                expect(response.status).to.equal(201);
            });
            it('should include the collection directory in the root directory listing', async () => {
                const response = await authenticatedRequest('PROPFIND', storageBaseUri);
                expect(response.status).to.equal(207);

                // The webdav utility does return urls, but it uses the http scheme on it.
                // For that reason, we expect the url to be in the response, but without scheme
                const expectedUri = storageBaseUri.substring(5) + permissionCollection.location
                expect(response.body.toString()).to.contain(expectedUri);
            });
        })

    })
});
