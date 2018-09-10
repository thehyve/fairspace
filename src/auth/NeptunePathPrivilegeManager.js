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
                switch (data.access) {
                    case 'None':
                        callback(null, false);
                        break;
                    case 'Read':
                        callback(null, privilege.startsWith('canRead'));
                        break;
                    case 'Write':
                        let wantToRemoveCollection = resource.context.request.method === 'DELETE' && fullPath.paths.length === 1;
                        callback(null, !wantToRemoveCollection);
                        break;
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
