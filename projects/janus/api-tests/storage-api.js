const request = require('superagent');
const expect = require('expect.js');

const auth = require('./support/auth');
const fixture = require('./support/fixture');
const config = require('./support/config');
const fakedata = require('./support/fakedata');

describe('Storage API', function() {
    let sessionCookie, uniqueId, collection;

    before(async () => {
        sessionCookie = await auth.retrieveSessionCookie();
        uniqueId = Math.round(100000 + (Math.random() * 900000));

        // Remove old collections
        await fakedata.removeAllCollections(sessionCookie);

        // Create a collection
        collection = await fakedata.createCollection(sessionCookie, uniqueId);
    });

    describe('Storage API', () => {
        let storageApiBaseUrl, directory;

        before(() =>  {
            storageApiBaseUrl = config.storageUri + '/api/storage/webdav/' + collection.location;
        })

        it('should respond to the propfind request', async () => {
            const response = await request('PROPFIND', storageApiBaseUrl)
                .set('Cookie', sessionCookie);

            expect(response.status).to.be.within(200, 299);
        })

        it('should be able to create a subdirectory', async () => {
            const response = await request('MKCOL', storageApiBaseUrl + '/subdir')
                .set('Cookie', sessionCookie);

            expect(response.status).to.equal(201);
        })

        it('should be able to upload and download a file', async () => {
            const data = fixture.load('myfile.txt');
            const response = await request('PUT', storageApiBaseUrl + '/file.txt')
                .set('Cookie', sessionCookie)
                .set('Content-length', data.length)
                .send(data);

            expect(response.status).to.be.within(200, 299);

            const download = await request('GET', storageApiBaseUrl + '/file.txt')
                .set('Cookie', sessionCookie)

            expect(download.status).to.equal(200)
            expect(download.text).to.equal(data.trim());
        })

    })

    describe('Files in a collection', () => {
        it('should make a file inaccessible after deleting a collection', async () => {
            // Create a new collection
            const customCollection = await fakedata.createCollection(sessionCookie, uniqueId + 1);
            const collectionStorageUrl = config.storageUri + '/api/storage/webdav/' + customCollection.location;

            // Upload a file to the collection
            const data = fixture.load('myfile.txt');
            const response = await request('PUT', collectionStorageUrl + '/file.txt')
                .set('Cookie', sessionCookie)
                .set('Content-length', data.length)
                .send(data);

            // Ensure it can be downloaded
            const download = await request('GET', collectionStorageUrl + '/file.txt')
                .set('Cookie', sessionCookie)

            expect(download.status).to.equal(200);

            // Delete the collection
            const deletedCollection = await request('DELETE', config.workspaceUri + '/api/collections/' + customCollection.id)
                .set('Cookie', sessionCookie);

            expect(deletedCollection.status).to.be.within(200, 299);

            // Verify the file can not be downloaded anymore
            // The actual response code does not really matter, as long as it indicates a client error
            // Implementations could either return a 404 (indicating not found) or 401 (because the
            // collection itself does not exist anymore, and the user does not have access to the path)
            const downloadInvalid = await request('GET', collectionStorageUrl + '/file.txt')
                .set('Cookie', sessionCookie)
                .ok(response => response.status < 500)

            expect(downloadInvalid.status).to.within(400, 499);

        });
    });
});
