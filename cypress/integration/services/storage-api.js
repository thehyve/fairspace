describe('Storage API', function () {
    const storageApiBaseUrl = '/api/storage/webdav/';
    const collectionName = 'StorageAPI collection';
    let collection;
    let uniqueId;

    before(() => {
        cy.addCollectionFast({name: collectionName})
            .then(response => {
                expect(response.status).to.equal(201);
                const url = response.headers['location'];
                return url.substr(url.lastIndexOf('/') + 1);
            })
            .then(collectionId => cy.request('/api/collections/' + collectionId))
            .then(response => {
                expect(response.status).to.equal(200);
                collection = response.body;
            });
    });

    beforeEach(() => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));
    });

    // Disabled for now as cy.request() does not allow custom
    // HTTP methods
    xit('should allow known file operations', () => {
        const collectionStorageBaseUrl = storageApiBaseUrl + collection.location;
        const directory = '/subdir';

        // Create directory
        cy.request({
            method: 'MKCOL',
            url: collectionStorageBaseUrl + directory
        }).its('status').should('equal', 200);

        // Upload file
        cy.uploadFileFast(collection.id, '/subdir', 'myfile.txt');

        // Copy file
        cy.request({
            method: 'COPY',
            url: collectionStorageBaseUrl + directory + '/myfile.txt',
            headers: {
                Destination: collectionStorageBaseUrl + directory + '/copied.txt'
            }
        }).its('status').should('equal', 201);

        cy.request(collectionStorageBaseUrl + directory + '/myfile.txt')
            .its('status').should('equal', 200);

        cy.request(collectionStorageBaseUrl + directory + '/copied.txt')
            .its('status').should('equal', 200);

        // Move file
        cy.request({
            method: 'MOVE',
            url: collectionStorageBaseUrl + directory + '/copied.txt',
            headers: {
                Destination: collectionStorageBaseUrl + '/moved.txt'
            }
        }).its('status').should('equal', 201);

        cy.request(collectionStorageBaseUrl + directory + '/copied.txt')
            .its('status').should('equal', 404);

        cy.request(collectionStorageBaseUrl + '/moved.txt')
            .its('status').should('equal', 200);

        // Delete a file
        cy.request({
            method: 'DELETE',
            url: collectionStorageBaseUrl + '/moved.txt'
        }).its('status').should('equal', 204);

        cy.request(collectionStorageBaseUrl + 'moved.txt')
            .its('status').should('equal', 404);

        // Delete a directory
        cy.request({
            method: 'DELETE',
            url: collectionStorageBaseUrl + directory
        }).its('status').should('equal', 204);

        cy.request(collectionStorageBaseUrl + directory + '/myfile.txt')
            .its('status').should('equal', 404);
    });

    it('should make a file inaccessible after deleting a collection', () => {
        const fileCollection = 'File collection ' + uniqueId;
        let uploadedFileUrl;

        cy.uploadFileFast(collection.id)
            .then(fileUrl => {
                // Verify it can be downloaded
                cy.request(fileUrl).its('status').should('equal', 200);
                uploadedFileUrl = fileUrl;
            })
            .then(() =>
                // Delete the collection
                cy.deleteCollectionFast(collection.id)
            )
            .then(() =>
                // Verify the file can not be downloaded anymore
                cy.request({url: uploadedFileUrl, failOnStatusCode: false}).its('status').should('equal', 404));

    });
});
