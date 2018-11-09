const sinon = require('sinon');
const assert = require('assert');

const EventEmitter = require('../../src/events/EventEmitter')

describe('EventEmitter', () => {
    const methods = ['PUT', 'GET', 'PROPFIND', 'COPY', 'MOVE', 'DELETE'];
    const exchangeName ='test-exchange';
    let rabbotMock, collectionApiMock, fileTypeProviderMock, nextMock;

    beforeEach(() => {
        nextMock = sinon.spy();
        rabbotMock = {
            publish: sinon.spy()
        }

        collectionApiMock = {
            retrieveCollection: sinon.stub().resolves({ name: 'test'})
        }

        fileTypeProviderMock = {
            type: sinon.stub().resolves('test-type')
        }

        emitter = EventEmitter(rabbotMock, collectionApiMock, fileTypeProviderMock, exchangeName);
    })

    it('should emit events to the right exchange', () =>
        emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => assert.equal(rabbotMock.publish.args[0][0], exchangeName))
    )

    it('should include the collection in events', () =>
        emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => {
                assert.deepEqual(collectionApiMock.retrieveCollection.args[0], ['subdir', {'password':'token'}])
                assert.equal(rabbotMock.publish.args[0][1].body.collection.name, 'test')
            })
    )

    it('should include null if collection retrieval fails', () => {
        collectionApiMock.retrieveCollection = sinon.stub().rejects(new Error("Error message"))
        emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => {
                assert.equal(rabbotMock.publish.args[0][1].body.collection, null)
            })
    })

    it('should include the path type in events', () =>
        emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => {
                assert.deepEqual(fileTypeProviderMock.type.args[0][1], '/subdir')
                assert.equal(rabbotMock.publish.args[0][1].body.type, 'test-type')
            })
    )

    it('should include unknown type if file stat fails', () => {
        fileTypeProviderMock.type = sinon.stub().rejects(new Error("Error message"))
        emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => {
                assert.equal(rabbotMock.publish.args[0][1].body.type, 'UNKNOWN')
            })
    })

    it('should also call next on invalid HTTP methods', () =>
        emitter(constructWebdavArgs('UNKNOWN-VERB'), nextMock)
            .then(() => {
                assert(!collectionApiMock.retrieveCollection.called)
                assert(!rabbotMock.publish.called)
                assert(nextMock.called)
            })
    )


    methods.forEach(method =>
        it('should emit an event for ' + method + ' calls', () =>
            emitter(constructWebdavArgs(method), nextMock)
                .then(() => {
                    assert(collectionApiMock.retrieveCollection.called)
                    assert(rabbotMock.publish.called)
                    assert(nextMock.called)
                })
        )
    );

    const constructWebdavArgs = method => ({
        request: {
            method: method,
            path: '/subdir',
            headers: { 'content-length': 100 }
        },
        response: {
            get: () => 10
        },
        user: {
            password: 'token'
        }
    })

})
