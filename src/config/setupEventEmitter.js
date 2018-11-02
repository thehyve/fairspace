const eventEmitter = require('../events/EventEmitter');
const rabbot = require('rabbot');

/**
 * Setup method for emitting events to RabbitMQ
 *
 * This method does not register an express.js middleware, as the webdav server
 * does not continue executing the express.js middleware. For that reason, the emitter
 * is attached to the webdavserver itself
 * @param server
 * @param connectionSettings
 * @param exchangeName
 */
module.exports = function setupEventEmitter(server, connectionSettings, exchangeName) {
    console.log("Emitting events to RabbitMQ on host " + connectionSettings.host);

    rabbot.configure({
        connection: connectionSettings,
        exchanges: [
            { name: exchangeName, type: 'topic' }
        ]
    }).then(() => {
        console.log("Connection with RabbitMQ has been established")
        server.afterRequest(eventEmitter(rabbot, exchangeName));
    })
};
