const fs = require('fs')

/**
 * This class provides a method to retrieve the file type
 * over AMQP
 * @returns {function(Args, Function): *}
 */
const TYPE_DIRECTORY = 'DIRECTORY';
const TYPE_FILE = 'FILE';
const TYPE_UNKNOWN = 'UNKNOWN';

module.exports = {
    TYPE_DIRECTORY: TYPE_DIRECTORY,
    TYPE_FILE: TYPE_FILE,
    TYPE_UNKNOWN: TYPE_UNKNOWN,

    webdav: (rootFileSystem) => {
        const typeAsPromise = (ctx, path) =>
            new Promise((resolve, reject) => {
                rootFileSystem.type(ctx, path, (e, type) => {
                    if(e) {
                        reject(e)
                    } else {
                        resolve(type)
                    }
                })
            })

        const type = (ctx, path) =>
            typeAsPromise(ctx, path)
                .then(type => {
                    if(type.isDirectory) return TYPE_DIRECTORY;
                    if(type.isFile) return TYPE_FILE;
                    return TYPE_UNKNOWN;
                })

        return {
            type: type
        }
    }
}
