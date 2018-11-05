const eventEmitter = require('../events/EventEmitter');
const rabbot = require('rabbot');

/**
 * Setup method for emitting events to RabbitMQ
 *
 * This method does not register an express.js middleware, as the webdav server
 * does not continue executing the express.js middleware. For that reason, the emitter
 * is attached to the webdavserver itself
 * @param server
 * @param settings
 * @param exchangeName
 */
module.exports = function setupEventEmitter(server, settings) {
    console.log("Emitting events to RabbitMQ on host " + settings.host);

    rabbot.configure({
        connection: settings,
        exchanges: [
            { name: settings.exchange, type: 'topic' }
        ]
    }).then(() => {
        console.log("Connection with RabbitMQ has been established")
        server.afterRequest(eventEmitter(rabbot, settings.exchange));
    })
};
