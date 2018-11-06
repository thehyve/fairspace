const nock = require('nock');
const assert = require('assert');
const CollectionApi = require('../../src/api/CollectionApi');

const baseUrl = 'http://fairspace.io/api/collections?location=%s';

describe('CollectionApi', () => {
    beforeEach(() => {
        nock.cleanAll();
    })

    it('sends the authorization header to the backend service', () => {
        const mockedBackend = nock('http://fairspace.io', {
            reqheaders: {
                'Authorization': 'Bearer Alice'
            }
        })
        .get('/api/collections')
        .query(true)
        .reply(200);

        const collectionApi = new CollectionApi(baseUrl);
        return collectionApi.retrieveCollection('location-01', {password: 'Alice'})
            .then(() => mockedBackend.done())
    });

    it('sends the location as parameter to the backend service', () => {
        const mockedBackend = nock('http://fairspace.io')
            .get('/api/collections')
            .query({location: 'location-01'})
            .reply(200);

        const collectionApi = new CollectionApi(baseUrl);
        return collectionApi.retrieveCollection('location-01', {})
            .then(() => mockedBackend.done())
    });

    describe('Cache', () => {
        it('caches requests based on the returned Cache-Control header', () => {
            const mockedBackend = nock('http://fairspace.io')
                .get('/api/collections')
                .query(true)
                .once()
                    .reply(200, [{data: 'test'}], {'Cache-Control': 'max-age=5'});

            const collectionApi = new CollectionApi(baseUrl);
            const makeCall = () => collectionApi
                .retrieveCollection('location-01', { password: 'token1'});

            return makeCall()
                // Make sure we are done after the first call
                .then(() => mockedBackend.done())

                // Make a second call
                .then(makeCall)
        });

        it('does not cache requests without Cache-Control header', () => {
            const mockedBackend = nock('http://fairspace.io')
                .get('/api/collections')
                .query(true)
                .twice()
                .reply(200, [{data: 'test'}]);

            const collectionApi = new CollectionApi(baseUrl);
            const makeCall = () => collectionApi
                .retrieveCollection('location-01', { password: 'token1'});

            return makeCall()
                // Make a second call
                .then(makeCall)
                // Make sure we are done after the second call, i.e. two calls were made
                .then(() => mockedBackend.done())
        });

        it('caches requests per user', () => {
            const mockedBackend = nock('http://fairspace.io')
                .get('/api/collections')
                .query(true)
                .twice()
                .reply(200, [{data: 'test'}], {'Cache-Control': 'max-age=5'});

            const collectionApi = new CollectionApi(baseUrl);
            const makeCall = (token) => collectionApi
                .retrieveCollection('location-01', { password: token});

            return makeCall('user1')
                // Make a second call
                .then(() => makeCall('user2'))
                // Make sure we are done after the second call, i.e. two calls were made
                .then(() => mockedBackend.done())
        });
    })

});
