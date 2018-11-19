const zipkin = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const HttpLogger = require('zipkin-transport-http').HttpLogger;

module.exports = function setupTracingMiddleware(app, tracingConfiguration) {
    console.log("Use tracing middleware to send traces to " + tracingConfiguration.zipkinUrl);
    const localServiceName = 'Titan';
    const ctxImpl = new zipkin.ExplicitContext();
    const recorder = new zipkin.BatchRecorder({
        logger: new HttpLogger({
            endpoint: tracingConfiguration.zipkinUrl + '/api/v2/spans',
            jsonEncoder: zipkin.jsonEncoder.JSON_V2
        })
    });
    const sampler = new zipkin.sampler.CountingSampler(tracingConfiguration.samplingRate);
    const tracer = new zipkin.Tracer({ctxImpl, recorder, sampler, localServiceName});

    return app.use(zipkinMiddleware({tracer}));
}
