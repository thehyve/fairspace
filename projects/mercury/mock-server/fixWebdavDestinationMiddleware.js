module.exports = function fixWebdavDestinationMiddleware(path) {
    return function (req, res, next) {
        if (req.url.indexOf(path) !== 0)
            return next();

        // See if a destination header is given, if so, remove the
        // path-prefix from it, as the webdav server expects it not to
        // be there
        if(req.headers['destination']) {
            req.headers['destination'] = req.headers['destination'].replace(path, '');
        }

        return next();
    };
}

