module.exports = {
    "rootPath": "/tmp",
    "auth": {
        "enabled": false
    },
    "tracing": {
        "enabled": false
    },
    "rabbitmq": {
        "enabled": true,
        "host": "localhost",
        "vhost": "",
        "user": "guest",
        "pass": "guest"
    },
    "urls": {
        "collections": "http://fairspace.io/api/collections?location=%s"
    }
}
