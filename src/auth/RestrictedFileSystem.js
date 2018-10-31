const PhysicalFileSystem = require("webdav-server").v2.PhysicalFileSystem;
const Errors = require("webdav-server").v2.Errors;

class RestrictedFileSystem extends PhysicalFileSystem {
    constructor(rootPath, permissions) {
        super(rootPath);
        this.permissions = permissions;
    }

    _readDir(path, ctx, callback) {
        super._readDir(path, ctx, (e, files) => {
            if (!e && path.paths.length === 0) { // Filter hidden collections
                Promise.all(files.map(f => this.permissions.retrieveAccess(f, ctx.context.user)))
                    .then(access => {
                        let visibleCollections = files.filter((file, index) => access[index] !== 'None');
                        callback(null, visibleCollections);
                    })
                    .catch(err => callback(Errors.ResourceNotFound, files));
            } else {
                callback(e, files)
            }
        });
    }
}


module.exports = RestrictedFileSystem;
