let PrivilegeManager = require("webdav-server").v2.PrivilegeManager;

class NeptunePathPrivilegeManager extends PrivilegeManager {
    constructor(permissions) {
        super();
        this.permissions = permissions;
    }


    _can(fullPath, user, resource, privilege, callback) {
        if (fullPath.paths.length === 0) {
            return callback(null, ['canReadProperties', 'canReadLocks'].includes(privilege));
        }

        let collectionLocation = fullPath.paths[0];

        this.permissions.retrieveAccess(collectionLocation, user)
            .then(access => {
                let criticalCollectionOperation = (fullPath.paths.length === 1)
                    && ['MKCOL', 'MOVE', 'COPY', 'DELETE'].includes(resource.context.request.method)
                    && privilege.startsWith('canWrite');
                // Operations with top-level directories should be made via Neptune which sets Anticipated-Operation
                if (criticalCollectionOperation) {
                    callback(null, (access === 'Manage') && (resource.context.headers.headers['anticipated-operation'] === 'true'));
                } else {
                    switch (access) {
                        case 'Read':
                            callback(null, privilege.startsWith('canRead'));
                            break;
                        case 'Write':
                        case 'Manage':
                            callback(null, true);
                            break;
                        default:
                            callback(null, false);
                    }
                }
            })
            .catch(err => {
                console.error("Retrieving access for collection with location " + collectionLocation + " failed:", err.message);
                if (err && err.response && err.response.status === 404) {
                    callback(null, false)
                } else {
                    callback(err, false)
                }
            });
    }
}

module.exports = NeptunePathPrivilegeManager;
