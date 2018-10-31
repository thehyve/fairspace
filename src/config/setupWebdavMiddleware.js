const AuthAwareFileSystem = require("../auth/RestrictedFileSystem");
const webdav = require('webdav-server').v2;
const fixWebdavDestinationMiddleware = require('./fixWebdavDestinationMiddleware');
const jwtAuthentication = require('../auth/jwt-authentication');
const PrivilegeManager = require('../auth/NeptunePathPrivilegeManager');
const Permissions = require('../auth/Permissions');

module.exports = function setupWebdavMiddleware(app, physicalRootPath, webdavPath, authEnabled, permissionsEndpointUrl) {
    const permissions = new Permissions(permissionsEndpointUrl);
    const server = new webdav.WebDAVServer({
        requireAuthentification: authEnabled,
        httpAuthentication: jwtAuthentication,
        rootFileSystem: new AuthAwareFileSystem(physicalRootPath, permissions),
        privilegeManager: new PrivilegeManager(permissions)
    });

    app.use(fixWebdavDestinationMiddleware(webdavPath));
    return app.use(webdav.extensions.express(webdavPath, server));
}
