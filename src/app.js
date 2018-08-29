const app = require('express')();
const webdav = require('webdav-server').v2;
const zipkin = require('zipkin');
const zipkinMiddleware = require('./tracing/customTracingMiddleware');
const HttpLogger = require('zipkin-transport-http').HttpLogger;
const noopHttpAuthentication = require('./auth/noop-http-webdav-authentication');
const jwksVerifier = require('./auth/verify-jwt-with-jwks');

// Configuration parameters
const rootPath = process.env.FILES_FOLDER || '/data';
const jwksUrl = process.env.JWKS_URL;
const authEnabled = process.env.AUTH_ENABLED !== 'false';
const zipkinEndointUrl = process.env.ZIPKIN_URL || 'http://localhost:9411'; // || 'http://jaeger-collector.jaeger:9411';
const zipkinSamplingRate = process.env.ZIPKIN_SAMPLING_RATE || 1; // 0.01;

// Respond to / anonymously to allow for health checks
app.get('/', (req, res) => res.send('Hi, I\'m Titan!').end());

app.use(setupTracingMiddleware(zipkinEndointUrl, zipkinSamplingRate))
if(authEnabled)
    app.use(setupAuthMiddleware(jwksUrl))
app.use(setupWebdavMiddleware(rootPath));

module.exports = app;

function setupAuthMiddleware(jwksUrl) {
    return jwksVerifier.middleware({url: jwksUrl})
}

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

function setupWebdavMiddleware(rootPath) {
    const server = new webdav.WebDAVServer({
        httpAuthentication: noopHttpAuthentication,
        rootFileSystem: new webdav.PhysicalFileSystem(rootPath)
    });

    return webdav.extensions.express('/api/storage/webdav/', server)
}

