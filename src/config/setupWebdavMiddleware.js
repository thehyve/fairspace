const webdav = require('webdav-server').v2;
const fixWebdavDestinationMiddleware = require('./fixWebdavDestinationMiddleware');
const jwtAuthentication = require('../auth/jwt-authentication');
const PrivilegeManager = require('../auth/NeptunePathPrivilegeManager');

module.exports = function setupWebdavMiddleware(app, physicalRootPath, webdavPath, authEnabled, permissionsEndpointUrl) {
    const server = new webdav.WebDAVServer({
        requireAuthentification: authEnabled,
        httpAuthentication: jwtAuthentication,
        rootFileSystem: new webdav.PhysicalFileSystem(physicalRootPath),
        privilegeManager: new PrivilegeManager(permissionsEndpointUrl)
    });

    app.use(fixWebdavDestinationMiddleware(webdavPath));
    return app.use(webdav.extensions.express(webdavPath, server));
}
