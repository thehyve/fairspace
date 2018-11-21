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
                assert.deepEqual(collectionApiMock.retrieveCollection.args[0], ['subdir 1', {'password':'token'}])
                assert.equal(rabbotMock.publish.args[0][1].body.collection.name, 'test')
            })
    )

    it('should include null if collection retrieval fails', () => {
        collectionApiMock.retrieveCollection = sinon.stub().rejects(new Error("Error message"))
        return emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => {
                assert.equal(rabbotMock.publish.args[0][1].body.collection, null)
            })
    })

    it('should include the path type in events', () =>
        emitter(constructWebdavArgs('PUT'), nextMock)
            .then(() => {
                assert.deepEqual(fileTypeProviderMock.type.args[0][1], '/subdir 1')
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

    describe('Moving and copying', () => {
        it('should include the destination for MOVE events', () => {
            const args = constructWebdavArgs('MOVE');
            args.request.headers.destination = '/newdir';

            return emitter(args, nextMock)
                .then(() => {
                    assert.equal(rabbotMock.publish.args[0][1].body.destination, '/newdir')
                })
        })

        it('should include the destination for COPY events', () => {
            const args = constructWebdavArgs('COPY');
            args.request.headers.destination = '/newdir';

            return emitter(args, nextMock)
                .then(() => {
                    assert.equal(rabbotMock.publish.args[0][1].body.destination, '/newdir')
                })
        })

        it('should strip the hostname from the destination header if present', () => {
            const args = constructWebdavArgs('COPY');
            args.request.headers.destination = 'http://fake-site:102/newdir';

            return emitter(args, nextMock)
                .then(() => {
                    assert.equal(rabbotMock.publish.args[0][1].body.destination, '/newdir')
                })
        })

        it('should use the destination path to determine the type for MOVE events', () => {
            const args = constructWebdavArgs('MOVE');
            args.request.headers.destination = '/newdir';
            emitter(args, nextMock)
                .then(() => {
                    assert.deepEqual(fileTypeProviderMock.type.args[0][1], '/newdir')
                })
        })

        it('should use the destination path to determine the type for COPY events', () => {
            const args = constructWebdavArgs('COPY');
            args.request.headers.destination = '/newdir';
            emitter(args, nextMock)
                .then(() => {
                    assert.deepEqual(fileTypeProviderMock.type.args[0][1], '/newdir')
                })
        })

    });

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
            path: '/subdir%201',
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
