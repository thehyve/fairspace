let PrivilegeManager = require("webdav-server").v2.PrivilegeManager;
let util = require('util');
let axios = require('axios');
let Cache = require('ttl');

class NeptunePathPrivilegeManager extends PrivilegeManager {
    constructor(permissionsUrl) {
        super();
        this.permissionsUrl = permissionsUrl;
        this.cache = new Cache({capacity: 1024})
    }


    _can(fullPath, user, resource, privilege, callback) {
        if (fullPath.paths.length === 0) {
            return callback(null, ['canReadProperties', 'canReadLocks'].includes(privilege));
        }

        let collectionLocation = fullPath.paths[0];

        this._retrieveAccess(collectionLocation, user)
            .then(access => {
                let criticalCollectionOperation = (fullPath.paths.length === 1)
                    && ['MKCOL', 'MOVE', 'COPY', 'DELETE'].includes(resource.context.request.method)
                    && privilege.startsWith('canWrite');
                // Operations with top-level directories should be made via Neptune which sets Anticipated-Operation
                if (criticalCollectionOperation) {
                    callback(null, (access === 'Manage') && (resource.context.headers.headers['anticipated-operation'] === 'true'));
                    return
                }

                switch (access) {
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
                if (err && err.response && err.response.status === 404) {
                    callback(null, false)
                } else {
                    callback(err, false)
                }
            });
    }

    _retrieveAccess(collectionLocation, user) {
        let key = collectionLocation + ' ' + user.password;

        let access = this.cache.get(key);
        return access
            ? Promise.resolve(access)
            : axios.get(util.format(this.permissionsUrl, encodeURIComponent(collectionLocation)),
                {headers: {'authorization': 'Bearer ' + user.password}})
                .then(response => {
                    let access = response.data.access;

                    let cacheControl = response.headers['cache-control'];
                    if (cacheControl && cacheControl.startsWith('max-age=')) {
                        let ttl = cacheControl.substring('max-age='.length) * 1000;
                        this.cache.put(key, access, ttl)
                    }

                    return access;
                })
    }
}

module.exports = NeptunePathPrivilegeManager;
