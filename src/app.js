const app = require('express')();
const deepmerge = require('deepmerge');
const setupTracingMiddleware = require('./config/setupTracingMiddleware');
const setupWebdavMiddleware = require('./config/setupWebdavMiddleware');
const setupEventEmitter = require('./config/setupEventEmitter');
const setupCollectionApi = require('./config/setupCollectionApi');

// Configuration parameters
const defaultConfig = {
    "rootPath": "/data",
    "basePath":"/api/storage/webdav",
    "auth": {
        "enabled": true
    },
    "tracing": {
        "enabled": true,
        "zipkinUrl": "",
        "samplingRate": 0.01
    },
    "rabbitmq": {
        "enabled": true,
        "exchange": "storage"
    },
    "urls":{
        "collections": ""
    }
}

// Read external configuration file
let configuration;
if(process.env.CONFIG_FILE) {
    configuration = deepmerge(defaultConfig, require(process.env.CONFIG_FILE))
} else {
    configuration = defaultConfig;
}

// Respond to / anonymously to allow for health checks
app.get('/', (req, res, next) => req.get('probe') ? res.send('Hi, I\'m Titan!').end() : next());

if(configuration.tracing.enabled) setupTracingMiddleware(app, configuration.tracing);

const collectionApi = setupCollectionApi(configuration);
const eventEmitterSetupClosure = server => setupEventEmitter(server, collectionApi, configuration.rabbitmq)
setupWebdavMiddleware(app, configuration, collectionApi, eventEmitterSetupClosure);

module.exports = app;
