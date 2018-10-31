const zipkin = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const HttpLogger = require('zipkin-transport-http').HttpLogger;

module.exports = function setupTracingMiddleware(app, zipkinEndpointUrl, samplingRate) {
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

    return app.use(zipkinMiddleware({tracer}));
}
