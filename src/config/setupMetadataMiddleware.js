const metadataMiddleware = require('../metadata/MetadataMiddleware');

module.exports = function setupMetadataMiddleware(app, metadataEndpointUrl) {
    console.log("Using metadata middleware with url " + metadataEndpointUrl);
    app.use(metadataMiddleware(metadataEndpointUrl));
};
