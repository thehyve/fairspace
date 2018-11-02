let util = require('util');
let axios = require('axios');
let Cache = require('ttl');


class Permissions {
    constructor(permissionsUrl) {
        this.permissionsUrl = permissionsUrl;
        this.cache = new Cache({capacity: 1024})
    }

    retrieveAccess(collectionLocation, user) {
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

module.exports = Permissions;
