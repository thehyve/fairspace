const FileTypeProvider = require('./FileTypeProvider')

/**
 * This WebdavServer afterRequest handler emits events for file operations
 * over AMQP
 * @returns {function(Args, Function): *}
 */
module.exports = function EventEmitter(rabbot, collectionApi, fileTypeProvider, exchangeName) {
    const publish = event => rabbot.publish(exchangeName, event);

    const getCollection = (req, user) => {
        const paths = req.path.split('/');

        if(paths.length == 0 || !paths[1]) {
            throw Error("No correct path specified to retrieve a collection");
        }

        return collectionApi.retrieveCollection(paths[1], user)
    }

    const readEvent = req => ({
        routingKey: 'read',
        type: "io.fairspace.titan.readDir",
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
            destination: req.headers['destination']
        }
    })

    const moveEvent = req => ({
        routingKey: 'move',
        type: "io.fairspace.titan.move",
        body: {
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
            console.debug("Emitting event for", args.request.method, "on", args.request.path);

            // Add collection information to the event
            const addCollection = getCollection(args.request, args.user)
                .catch(e => {
                    console.error("Error while retrieving collection for path", args.request.path, ":", e.message);
                    return null
                });

            // Add path and type to the event
            const addPath = fileTypeProvider.type(args.request.path)
                .catch(e => {
                    console.error("Error while retrieving file information for path", args.request.path, ":", e.message);
                    return FileTypeProvider.TYPE_UNKNOWN
                });

            // Wait for both information sources before sending the event
            return Promise.all([addCollection, addPath])
                .then(([collection, type]) => {
                    // Generate base event
                    const event = methodToEventsMap[args.request.method](args.request, args.response)

                    // Append the information
                    event.body.collection = collection;
                    event.body.path = args.request.path;
                    event.body.type = type;

                    return event;
                })
                .then(publish)
                .then(next)
                .catch(e => {
                    console.error("Error while publishing event to RabbitMQ:", e);
                });
        } else {
            return Promise.resolve().then(next());
        }
    };

    return handler;
};

