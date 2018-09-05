let PrivilegeManager = require("webdav-server").v2.PrivilegeManager;
let util = require('util');
let axios = require('axios');

function standardizePath(path) {
    if (!path)
        path = '/';
    let startIndex = path.indexOf('://');
    if (startIndex !== -1) {
        path = path.substr(startIndex + 3);
        path = path.substr(path.indexOf('/') + 1);
    }
    path = path.replace(/\\/g, '/');
    let rex = /\/\//g;
    while (rex.test(path))
        path = path.replace(rex, '/');
    path = path.replace(/\/$/g, '');
    path = path.replace(/^([^\/])/g, '/$1');
    if (path.length === 0)
        path = '/';
    return path;
}

class NeptunePathPrivilegeManager extends PrivilegeManager {
    constructor(permissionsUrl) {
        super();
        this.permissionsUrl = permissionsUrl;
    }

    _can(fullPath, user, resource, privilege, callback) {
        let standardizedPath = standardizePath(fullPath.toString());
        if (standardizedPath === '/') {
            return callback(null, ['canReadProperties', 'canReadLocks'].includes(privilege));

        }

        let collectionId = standardizedPath.split('/')[1];

        axios.get(util.format(this.permissionsUrl, collectionId),
            {headers: {'authorization': resource.context.headers.headers['authorization']}})
            .then(({data}) => {
                let permission = data.find(p => p.subject === user.username) || {access: 'None'};
                switch (permission.access) {
                    case 'None':
                        callback(null, false);
                        break;
                    case 'Read':
                        callback(null,
                            ['canRead', 'canReadProperties', 'canReadContent', 'canReadLocks'].includes(privilege));
                        break;
                    case 'Write':
                    case 'Manage':
                        callback(null,
                            ['canRead', 'canReadProperties', 'canReadContent', 'canReadLocks',
                                'canWrite', 'canWriteContent', 'canWriteLocks'].includes(privilege));
                        break;
                }
            })
            .catch(err => {
                console.log(err);
                callback(err, false)
            });
    }

}

module.exports = NeptunePathPrivilegeManager;
