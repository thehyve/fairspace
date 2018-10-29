module.exports = function fixWebdavDestinationMiddleware(path) {
     return (req, res, next) => {
        if (req.url.startsWith(path) && req.headers['destination']) {
            // See if a destination header is given, if so, remove the
            // path-prefix from it, as the webdav server expects it not to
            // be there
            req.headers['destination'] = req.headers['destination'].replace(path, '');
        }

        return next();
    };
};

