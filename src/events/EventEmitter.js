/**
 * This WebdavServer afterRequest handler emits events for file operations
 * over AMQP
 * @returns {function(Args, Function): *}
 */
module.exports = function EventEmitter(rabbot, exchangeName) {
    const publish = event => rabbot.publish(exchangeName, event);
    const readEvent = req => ({
        routingKey: 'read',
        type: "io.fairspace.titan.readDir",
        body: {
            path: req.path
        }
    })

    const downloadEvent = (req, res) => ({
        routingKey: 'download',
        type: "io.fairspace.titan.download",
        body: {
            path: req.path,
            contentLength: res.get('content-length')
        }
    })


    const uploadEvent = req => ({
        routingKey: 'upload',
        type: "io.fairspace.titan.upload",
        body: {
            path: req.path,
            contentLength: req.headers['content-length']
        }
    });

    const mkdirEvent = req => ({
        routingKey: 'mkdir',
        type: "io.fairspace.titan.mkDir",
        body: {
            path: req.path,
        }
    })

    const deleteEvent = req => ({
        routingKey: 'delete',
        type: "io.fairspace.titan.delete",
        body: {
            path: req.path,
        }
    })

    const copyEvent = req => ({
        routingKey: 'copy',
        type: "io.fairspace.titan.copy",
        body: {
            source: req.path,
            destination: req.headers['destination']
        }
    })

    const moveEvent = req => ({
        routingKey: 'move',
        type: "io.fairspace.titan.move",
        body: {
            source: req.path,
            destination: req.headers['destination']
        }
    })

    const methodToEventsMap = {
        GET: downloadEvent,
        PUT: uploadEvent,
        MKCOL: mkdirEvent,
        PROPFIND: readEvent,
        COPY: copyEvent,
        MOVE: moveEvent,
        DELETE: deleteEvent
    }

    const handler = (args, next) => {
        if(methodToEventsMap.hasOwnProperty(args.request.method)) {
            console.debug("Emitting event for", args.request.method, "on", args.request.path)
            publish(methodToEventsMap[args.request.method](args.request, args.response));
        }

        return next();
    };

    return handler;
};

