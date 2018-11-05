const app = require('express')();
const setupTracingMiddleware = require('./config/setupTracingMiddleware');
const setupWebdavMiddleware = require('./config/setupWebdavMiddleware');

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
    "urls":{
        "collections": ""
    }
}

// Read external configuration file
let configuration;
if(process.env.CONFIG_FILE) {
    configuration = {...defaultConfig, ...require(process.env.CONFIG_FILE)}
} else {
    configuration = defaultConfig;
}

// Respond to / anonymously to allow for health checks
app.get('/', (req, res, next) => req.get('probe') ? res.send('Hi, I\'m Titan!').end() : next());

if(configuration.tracing.enabled) setupTracingMiddleware(app, configuration.tracing);
setupWebdavMiddleware(app, configuration.rootPath, configuration.basePath, configuration.auth.enabled, configuration.urls.collections);

module.exports = app;
