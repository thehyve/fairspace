const request = require('superagent');
const expect = require('expect.js');

const auth = require('./support/auth');
const fakedata = require('./support/fakedata');
const config = require('./support/config');

describe('File-based metadata', function () {
    let sessionCookie, uniqueId, collection;
    let storageBaseUri

    before(async () => {
        sessionCookie = await auth.retrieveSessionCookie();
    })

    beforeEach(async () => {
        uniqueId = Math.round(100000 + (Math.random() * 900000));

        // Create a collection
        collection = await fakedata.createCollection(sessionCookie, uniqueId);
        storageBaseUri = config.storageUri + '/api/storage/webdav/' + collection.location;
    })

    it('should store parent-child relation on directory creation', async () => {
        let response;

        // Create a new directory
        response = await request('MKCOL', storageBaseUri + '/subdir')
            .set('Cookie', sessionCookie);

        expect(response.status).to.equal(201);

        // Wait some time to ensure the metadata is propagated.
        await sleep(500);

        // Verify that the collection itself has metadata describing this directory
        response = await request
            .get(config.workspaceUri + '/api/metadata/statements')
            .query({subject: collection.uri})
            .accept('application/ld+json')
            .set('Cookie', sessionCookie);

        const hasPart = getPropertyValue(response.body, 'http://fairspace.io/ontology#hasPart');

        expect(hasPart).to.be.ok();
        expect(hasPart.length).to.equal(1);

        // Verify that the file has metadata describing the link to the collection
        const fileUri = hasPart[0];
        response = await request
            .get(config.workspaceUri + '/api/metadata/statements')
            .query({subject: fileUri})
            .accept('application/ld+json')
            .set('Cookie', sessionCookie);

        const partOf = getPropertyValue(response.body, 'http://fairspace.io/ontology#partOf');

        expect(partOf).to.be.ok();
        expect(partOf.length).to.equal(1);
        expect(partOf[0]).to.equal(collection.uri)
    });

    it('should retain metadata (recursively) when copying', async () => {
        let response;

        // Create a new directory with subdirectory
        response = await request('MKCOL', storageBaseUri + '/toplevel-dir')
            .set('Cookie', sessionCookie);
        expect(response.status).to.equal(201);

        response = await request('MKCOL', storageBaseUri + '/toplevel-dir/sub-dir')
            .set('Cookie', sessionCookie);
        expect(response.status).to.equal(201);

        // Wait some time to ensure the metadata is propagated.
        await sleep(500);

        // Verify that the collection itself has metadata describing this directory
        response = await request
            .get(config.workspaceUri + '/api/metadata/statements')
            .query({subject: collection.uri})
            .accept('application/ld+json')
            .set('Cookie', sessionCookie);

        const hasPart = getPropertyValue(response.body, 'http://fairspace.io/ontology#hasPart');

        expect(hasPart).to.be.ok();
        expect(hasPart.length).to.equal(1);
        const toplevelDirUri = hasPart[0];

        // Retrieve the metadata uri for the subdir
        response = await request
            .get(config.workspaceUri + '/api/metadata/pid')
            .query({value: '/' + collection.location + '/toplevel-dir/sub-dir'})
            .set('Cookie', sessionCookie)

        expect(response.status).to.equal(200);
        const subdirUri = response.body.id;

        // Add metadata for the subdir
        const additionalMetadata = {
            "@id": subdirUri,
            "http://www.w3.org/2000/01/rdf-schema#label": "New description: " + uniqueId
        }

        response = await request
            .post(config.workspaceUri + '/api/metadata/statements')
            .type('application/ld+json')
            .set('Cookie', sessionCookie)
            .send(additionalMetadata);

        expect(response.status).to.equal(204);

        // Now copy the directory
        response = await request('COPY', storageBaseUri + '/toplevel-dir')
            .set('Cookie', sessionCookie)
            .set('Destination', storageBaseUri + '/new-dirname' );

        // Wait sometime and refresh to ensure that the metadata is propagated
        await sleep(500);

        // Verify the metadata has copied as well. First check whether the new dir is added as part of the collection
        response = await request
            .get(config.workspaceUri + '/api/metadata/statements')
            .query({subject: collection.uri})
            .accept('application/ld+json')
            .set('Cookie', sessionCookie);

        const newParts = getPropertyValue(response.body, 'http://fairspace.io/ontology#hasPart');

        expect(newParts).to.be.ok();
        expect(newParts.length).to.equal(2);

        // Check the new subdirectory for metadata
        response = await request
            .get(config.workspaceUri + '/api/metadata/pid')
            .query({value: '/' + collection.location + '/new-dirname/sub-dir'})
            .set('Cookie', sessionCookie);

        expect(response.status).to.equal(200);
        const newSubdirUri = response.body.id;

        // Check both the original and the new subdir for its label
        for(uri of [subdirUri, newSubdirUri]) {
            // Verify that the file itself has a connection to the collection and the right label
            response = await request
                .get(config.workspaceUri + '/api/metadata/statements')
                .query({subject: uri})
                .accept('application/ld+json')
                .set('Cookie', sessionCookie);

            // Verify collection
            const partOf = getPropertyValue(response.body, 'http://fairspace.io/ontology#partOf');
            expect(partOf).to.be.ok();
            expect(partOf.length).to.equal(1);

            // Verify label
            const label = getPropertyValue(response.body, "http://www.w3.org/2000/01/rdf-schema#label");
            expect(label).to.be.ok();
            expect(label.length).to.equal(1);
            expect(label[0]).to.equal("New description: " + uniqueId);
        }
    }).timeout(5000);
});

function sleep(ms){
    return new Promise(resolve => {
        setTimeout(resolve,ms)
    })
}
