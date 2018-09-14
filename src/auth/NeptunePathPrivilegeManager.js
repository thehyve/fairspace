let PrivilegeManager = require("webdav-server").v2.PrivilegeManager;
let util = require('util');
let axios = require('axios');

class NeptunePathPrivilegeManager extends PrivilegeManager {
    constructor(permissionsUrl) {
        super();
        this.permissionsUrl = permissionsUrl;
    }


    _can(fullPath, user, resource, privilege, callback) {
        if (fullPath.paths.length === 0) {
            return callback(null, ['canReadProperties', 'canReadLocks'].includes(privilege));
        }

        let collectionLocation = fullPath.paths[0];

        axios.get(util.format(this.permissionsUrl, encodeURIComponent(collectionLocation)),
            {headers: {'authorization': resource.context.headers.headers['authorization']}})
            .then(({data}) => {
                let criticalCollectionOperation = (fullPath.paths.length === 1)
                    && ['MKCOL', 'MOVE', 'COPY', 'DELETE'].includes(resource.context.request.method)
                    && privilege.startsWith('canWrite');
                // Operations with top-level directories should be made via Neptune which sets Anticipated-Operation
                if (criticalCollectionOperation) {
                    callback(null, (data.access === 'Manage') && (resource.context.headers.headers['anticipated-operation'] === 'true'));
                    return
                }

                switch (data.access) {
                    case 'None':
                        callback(null, false);
                        break;
                    case 'Read':
                        callback(null, privilege.startsWith('canRead'));
                        break;
                    case 'Write':
                    case 'Manage':
                        callback(null, true);
                        break;
                }
            })
            .catch(err => {
                console.error(err);
                callback(err, false)
            });
    }
}

module.exports = NeptunePathPrivilegeManager;
