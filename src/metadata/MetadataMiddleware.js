/**
 * This express.js middleware handles metadata changes based
 * upon file operations.
 * @param metadataBaseUrl
 * @returns {function(Request, Response, Function): *}
 */
module.exports = function MetadataMiddleware(metadataBaseUrl) {
    return (req, res, next) => {
        return next();
    };

};

