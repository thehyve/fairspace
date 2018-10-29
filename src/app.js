const app = require('express')();
const setupTracingMiddleware = require('./config/setupTracingMiddleware');
const setupWebdavMiddleware = require('./config/setupWebdavMiddleware');
const setupMetadataMiddleware = require('./config/setupMetadataMiddleware');

// Configuration parameters
const rootPath = process.env.FILES_FOLDER || '/data';
const basePath = '/api/storage/webdav';
const authEnabled = process.env.AUTH_ENABLED !== 'false';
const tracingEnabled = process.env.TRACING_ENABLED !== 'false';
const zipkinEndointUrl = process.env.ZIPKIN_URL || 'http://jaeger-collector.jaeger:9411';
const zipkinSamplingRate = process.env.ZIPKIN_SAMPLING_RATE || 0.01;
const permissionsEndpointUrl = process.env.PERMISSIONS_URL;
const metadataEndpointUrl = process.env.METADATA_URL;

// Respond to / anonymously to allow for health checks
app.get('/', (req, res, next) => req.get('probe') ? res.send('Hi, I\'m Titan!').end() : next());

if(tracingEnabled) setupTracingMiddleware(app, zipkinEndointUrl, zipkinSamplingRate);
setupWebdavMiddleware(app, rootPath, basePath, authEnabled, permissionsEndpointUrl);
setupMetadataMiddleware(app, metadataEndpointUrl);

module.exports = app;
