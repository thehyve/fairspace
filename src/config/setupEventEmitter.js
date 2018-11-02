const eventMiddleware = require('../events/EventMiddleware');
const rabbot = require('rabbot');

module.exports = function setupEventMiddleware(app, connectionSettings, exchangeName) {
    console.log("Emitting events to RabbitMQ on host " + connectionSettings.server);

    rabbot.configure({
        connection: connectionSettings,
        exchanges: [
            { name: exchangeName, type: 'topic' }
        ]
    }).then(() => {
        console.log("Connection with RabbitMQ has been established")
        app.use(eventMiddleware(rabbot, exchangeName));
    })
};
