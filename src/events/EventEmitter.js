/**
 * This express.js middleware emits events for file operations
 * over AMQP
 * @returns {function(Request, Response, Function): *}
 */
module.exports = function EventMiddleware(rabbot, exchangeName) {
    console.log("Event Middleware creation");

    const publish = event => rabbot.publish(exchangeName, event);
    const readEvent = req => ({
        routingKey: 'read',
        type: "io.fairspace.titan.readDir",
        body: {
            path: req.path
        }
    })

    const uploadEvent = req => ({
        routingKey: 'upload',
            type: "io.fairspace.titan.uploadEvent",
            body: {
            path: req.path,
                contentLength: req.headers['content-length']
        }
    })

    const middleware = (req, res, next) => {
        console.log("Middleware called");
        if(req.method === 'PUT') {
            console.log("Emitting event: PUT")
            publish(uploadEvent(req));
        } else if(req.method === 'PROPFIND') {
            console.log("Emitting event: PROPFIND")
            publish(readEvent(req));
        }

        return next();
    };

    return middleware;
};

