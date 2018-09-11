const axios = require('axios'),
      jwk2pem = require('pem-jwk').jwk2pem,
      jwt = require('express-jwt'),
      cache = require('expire-cache'),
      async = require('async');

/**
 * Retrieve the keyset specified by the URL, and cache it for some time
 * @param url
 * @returns {*}
 */
function getKeySet(options) {
    const expirationTimeInSeconds = options.cacheExpirationTimeInSeconds || 86400;

    if(!options.url) {
        throw(new Error("No JWKS url provided"));
    }

    // Try cache first
    const cachedValue = cache.get(options.url);
    if(cachedValue) {
        return Promise.resolve(cachedValue);
    }

    // Otherwise retrieve the data and cache it
    return axios.get(options.url, {timeout: 10000})
        .then(response => {
            cache.set(options.url, response.data, expirationTimeInSeconds);
            return response.data;
        });
}

/**
 * This function works as a express middleware by extending the express-jwt functionality
 * This middleware will retrieve a JWKS from the specified URL and verfiy the provided
 * JWT against any of those keys
 * @param options   Options for the express-jwt middleware, as well as one of the following options
 *              url:    URL to retrieve the JWKS from
 *              cacheExpirationTimeInSeconds: number of seconds to cache the JWKS. Defaults to one day
 *
 */
function middleware(options) {
    console.log("Use JWK middleware to verify JWT tokens against remote keys. Using options ", options);

    // Actual middleware function
    return function(req, res, next) {
        module.exports.keySetProvider(options)
            .then(keyset => {
                let lastError;

                if(!keyset || !keyset.keys) {
                    next(new Error("No proper JWKS provided"));
                }

                // See for each key if it can be used to verify the JWT
                async.some(
                    keyset.keys.map(jwk2pem),
                    (key, callback) => {
                        // All options provided to this middleware are forwarded
                        // to the jwt middleware, extended with the key
                        const jwtOptions = Object.assign(options, {secret: new Buffer(key)})
                        jwt(jwtOptions)(req, res, (e) => {
                            if(e) {
                                lastError = e;
                                callback(false);
                            } else {
                                callback(true);
                            }
                        })
                    }, (err, result) => {
                        // if result is true then at least one of keys could be used to verify the JWT
                        if(result) {
                            next()
                        } else {
                            next(lastError);
                        }
                    });
            })
            .catch(e => {
                next(new Error(e));
            });
    }
}

module.exports = {
    keySetProvider: getKeySet,
    middleware: middleware
};
