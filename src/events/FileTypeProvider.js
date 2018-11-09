const fs = require('fs')

/**
 * This class provides a method to retrieve the file type
 * over AMQP
 * @returns {function(Args, Function): *}
 */
const TYPE_DIRECTORY = 'DIRECTORY';
const TYPE_FILE = 'FILE';
const TYPE_UNKNOWN = 'UNKNOWN';

const stat = (path) =>
    new Promise((resolve, reject) => {
        fs.lstat(basePath + path, (error, stats) => {
            if(error) {
                reject(error)
            } else {
                resolve(stats)
            }
        })
    })

const type = (path) =>
    stat(path)
        .then(stats => {
            if(stats.isDirectory()) return TYPE_DIRECTORY;
            if(stats.isFile()) return TYPE_FILE;
            return TYPE_UNKNOWN;
        })

module.exports = {
    TYPE_DIRECTORY: TYPE_DIRECTORY,
    TYPE_FILE: TYPE_FILE,
    TYPE_UNKNOWN: TYPE_UNKNOWN,

    provider: (basePath) => ({
        stat: stat,
        type: type
    })
}
