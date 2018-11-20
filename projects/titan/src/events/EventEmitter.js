const FileTypeProvider = require('./FileTypeProvider')

/**
 * This WebdavServer afterRequest handler emits events for file operations
 * over AMQP
 * @returns {function(Args, Function): *}
 */
module.exports = function EventEmitter(rabbot, collectionApi, fileTypeProvider, exchangeName) {
    const publish = event => rabbot.publish(exchangeName, event);

    const getCollection = (path, user) => {
        const paths = path.split('/');

        if(paths.length == 0 || !paths[1]) {
            return Promise.reject(Error("No correct path specified to retrieve a collection"));
        }

        return collectionApi.retrieveCollection(paths[1], user)
    }

    const getDestination = req => {
        const destination = req.headers['destination']

        if(!destination) {
            return null;
        }

        // Check whether the destination contains a scheme and host/port
        // If so, remove it
        const startIndex = destination.indexOf('://');
        if(startIndex !== -1) {
            // Remove scheme and the hostname + port
            return destination.substring(destination.indexOf('/', startIndex + '://'.length))
        } else {
            return destination;
        }
    }

    const readEvent = req => ({
        routingKey: 'read',
        type: "io.fairspace.titan.read",
        body: {}
    })

    const downloadEvent = (req, res) => ({
        routingKey: 'download',
        type: "io.fairspace.titan.download",
        body: {
            contentLength: res.get('content-length')
        }
    })


    const uploadEvent = req => ({
        routingKey: 'upload',
        type: "io.fairspace.titan.upload",
        body: {
            contentLength: req.headers['content-length']
        }
    });

    const mkdirEvent = req => ({
        routingKey: 'mkdir',
        type: "io.fairspace.titan.mkDir",
        body: {}
    })

    const deleteEvent = req => ({
        routingKey: 'delete',
        type: "io.fairspace.titan.delete",
        body: {}
    })

    const copyEvent = req => ({
        routingKey: 'copy',
        type: "io.fairspace.titan.copy",
        body: {
            destination: getDestination(req)
        }
    })

    const moveEvent = req => ({
        routingKey: 'move',
        type: "io.fairspace.titan.move",
        body: {
            destination: getDestination(req)
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

    const handler = (ctx, next) => {
        next();

        return Promise.resolve().then(() => {
            if (methodToEventsMap.hasOwnProperty(ctx.request.method)) {
                const path = decodeURIComponent(ctx.request.path);

                console.debug("Emitting event for", ctx.request.method, "on", path);

                // Generate base event
                const event = methodToEventsMap[ctx.request.method](ctx.request, ctx.response);
                event.body.path = path;

                return getCollection(path, ctx.user) // Add collection information to the event
                    .catch(e => console.error("Error while retrieving collection for path", path, ":", e.message))
                    .then(collection => event.body.collection = collection)
                    .then(() => fileTypeProvider.type(ctx, path)) // Add file type to the event
                    .catch(e => console.error("Error while retrieving file information for path", path, ":", e.message))
                    .then(type => event.body.type = type || FileTypeProvider.TYPE_UNKNOWN)
                    .then(() => publish(event))
                    .catch(e => console.error("Error while publishing event to RabbitMQ:", e));
            }
        });
    };

    return handler;
};

