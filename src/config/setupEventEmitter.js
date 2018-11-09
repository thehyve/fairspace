const eventEmitter = require('../events/EventEmitter');
const rabbot = require('rabbot');
const WebdavFileTypeProvider = require('../events/FileTypeProvider').webdav

/**
 * Setup method for emitting events to RabbitMQ
 *
 * This method does not register an express.js middleware, as the webdav server
 * does not continue executing the express.js middleware. For that reason, the emitter
 * is attached to the webdavserver itself
 * @param server
 * @param collectionApi
 * @param settings
 * @param exchangeName
 */
module.exports = function setupEventEmitter(server, collectionApi, settings) {
    if(!settings.enabled) {
        console.log("Not emitting events due to configuration settings");
        return;
    }

    // Configure filetype provider
    const fileTypeProvider = WebdavFileTypeProvider(server.rootFileSystem());

    console.log("Emitting events to RabbitMQ on host " + settings.host);

    rabbot.configure({
        connection: settings,
        exchanges: [
            { name: settings.exchange, type: 'topic' }
        ]
    }).then(() => {
        console.log("Connection with RabbitMQ has been established")
        server.afterRequest(eventEmitter(rabbot, collectionApi, fileTypeProvider, settings.exchange));
    }).catch(e => {
        console.error("Connection with RabbitMQ failed:", e);
    })
};
