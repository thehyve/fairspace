const sinon = require('sinon');
const assert = require('assert');

const EventEmitter = require('../../src/events/EventEmitter')

describe('EventEmitter', () => {
    const methods = ['PUT', 'GET', 'PROPFIND', 'COPY', 'MOVE', 'DELETE'];
    const exchangeName ='test-exchange';
    let rabbotMock;

    beforeEach(() => {
        rabbotMock = {
            publish: sinon.spy()
        }

        emitter = EventEmitter(rabbotMock, exchangeName);
    })

    it('should emit events to the right exchange', () => {
        emitter(constructWebdavArgs('PUT'), () => {});
        assert.equal(rabbotMock.publish.args[0][0], exchangeName)
    })

    methods.forEach(method =>
        it('should emit an event for ' + method + ' calls', () => {
            emitter(constructWebdavArgs(method), () => {});
            assert(rabbotMock.publish.called)
        })
    );

    const constructWebdavArgs = method => ({
        request: {
            method: method,
            path: '/',
            headers: { 'content-length': 100 }
        },
        response: {
            get: () => 10
        }
    })

})
