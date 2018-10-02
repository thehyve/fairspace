const app = require('express')();
const webdav = require('webdav-server').v2;
const zipkin = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const HttpLogger = require('zipkin-transport-http').HttpLogger;
const jwtAuthentication = require('./auth/jwt-authentication');
const fixWebdavDestinationMiddleware = require('./fixWebdavDestinationMiddleware');
const PrivilegeManager = require("./auth/NeptunePathPrivilegeManager");

// Configuration parameters
const rootPath = process.env.FILES_FOLDER || '/data';

const authEnabled = process.env.AUTH_ENABLED !== 'false';

const tracingEnabled = process.env.TRACING_ENABLED !== 'false';
const zipkinEndointUrl = process.env.ZIPKIN_URL || 'http://jaeger-collector.jaeger:9411';
const zipkinSamplingRate = process.env.ZIPKIN_SAMPLING_RATE || 0.01;
const permissionsEndpointUrl = process.env.PERMISSIONS_URL;

// Respond to / anonymously to allow for health checks
app.get('/', (req, res, next) => req.get('probe') ? res.send('Hi, I\'m Titan!').end() : next());

if(tracingEnabled) app.use(setupTracingMiddleware(zipkinEndointUrl, zipkinSamplingRate));

setupWebdavMiddleware(rootPath, '/api/storage/webdav');

module.exports = app;

function setupTracingMiddleware(zipkinEndpointUrl, samplingRate) {
    console.log("Use tracing middleware to send traces to " + zipkinEndpointUrl);
    const localServiceName = 'Titan';
    const ctxImpl = new zipkin.ExplicitContext();
    const recorder = new zipkin.BatchRecorder({
        logger: new HttpLogger({
            endpoint: zipkinEndpointUrl + '/api/v2/spans',
            jsonEncoder: zipkin.jsonEncoder.JSON_V2
        })
    });
    const sampler = new zipkin.sampler.CountingSampler(samplingRate);
    const tracer = new zipkin.Tracer({ctxImpl, recorder, sampler, localServiceName});

    return zipkinMiddleware({tracer});
}

function setupWebdavMiddleware(physicalRootPath, webdavPath) {
    const server = new webdav.WebDAVServer({
        requireAuthentification: authEnabled,
        httpAuthentication: jwtAuthentication,
        rootFileSystem: new webdav.PhysicalFileSystem(physicalRootPath),
        privilegeManager: new PrivilegeManager(permissionsEndpointUrl)
    });

    app.use(fixWebdavDestinationMiddleware(webdavPath));
    app.use(webdav.extensions.express(webdavPath, server));
}

