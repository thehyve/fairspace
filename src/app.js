const app = require('express')();
const setupTracingMiddleware = require('./config/setupTracingMiddleware');
const setupWebdavMiddleware = require('./config/setupWebdavMiddleware');
const setupEventEmitter = require('./config/setupEventEmitter');
const PermissionsApi = require('./api/PermissionsApi');

// Configuration parameters
const DEFAULT_PARAMS = {
    rootPath: '/data',
    basePath: '/api/storage/webdav',
    authEnabled: true,
    tracing: {
        enabled: true,
        zipkinUrl: 'http://jaeger-collector.jaeger:9411',
        samplingRate: 0.01
    },
    rabbitmq: {
        name: 'default',
        exchange: 'storage'
    },
    urls: {
        collections: ''
    }
}

let params = DEFAULT_PARAMS;

if(process.env.CONFIG_FILE) {
    params = {...params, ...require(process.env.CONFIG_FILE)}
}

const rootPath = process.env.FILES_FOLDER || '/data';
const basePath = '/api/storage/webdav';
const authEnabled = process.env.AUTH_ENABLED !== 'false';
const tracingEnabled = process.env.TRACING_ENABLED !== 'false';
const zipkinEndointUrl = process.env.ZIPKIN_URL || 'http://jaeger-collector.jaeger:9411';
const zipkinSamplingRate = process.env.ZIPKIN_SAMPLING_RATE || 0.01;
const permissionsEndpointUrl = process.env.PERMISSIONS_URL;

const connectionSettings = {
    name: 'default',
    user: 'client',
    pass: 'client',
    host: 'localhost'
}

// Respond to / anonymously to allow for health checks
app.get('/', (req, res, next) => req.get('probe') ? res.send('Hi, I\'m Titan!').end() : next());

if(params.tracing.enabled) {
    setupTracingMiddleware(app, params.tracing.zipkinUrl, params.tracing.samplingRate);
}
const permissionsApi = params.authEnabled ? new PermissionsApi(params.urls.collections) : { retrieveAccess: () => Promise.resolve('Manage') }
setupWebdavMiddleware(app, params, permissionsApi, server => setupEventEmitter(server, params.rabbitmq));

module.exports = app;
