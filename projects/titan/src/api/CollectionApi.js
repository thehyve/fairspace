let util = require('util');
let axios = require('axios');
let Cache = require('ttl');

class CollectionApi {
    constructor(collectionUrl) {
        this.collectionUrl = collectionUrl;
        this.cache = new Cache({capacity: 1024})
    }

    retrieveCollection(collectionLocation, user) {
        let cacheKey = collectionLocation + '-' + user.password;
        return this.cached(
            cacheKey,
            () => axios.get(
                    util.format(this.collectionUrl, encodeURIComponent(collectionLocation)),
                    {headers: {'authorization': 'Bearer ' + user.password}}
                ),
            response => response.data[0]);
    }

    retrieveAccess(collectionLocation, user) {
        return this.retrieveCollection(collectionLocation, user)
            .then(collection => collection.access);
    }

    cached(cacheKey, retriever, dataExtractor) {
        let data = this.cache.get(cacheKey);

        return data
            ? Promise.resolve(data)
            : retriever()
                .then(response => {
                    // Retrieve the data from the response
                    let data = dataExtractor(response);

                    // Handle caching
                    let cacheControl = response.headers['cache-control'];

                    if (cacheControl && cacheControl.startsWith('max-age=')) {
                        let ttl = cacheControl.substring('max-age='.length) * 1000;
                        this.cache.put(cacheKey, data, ttl)
                    } else {
                        console.warn("No cache control headers found on Collections response");
                    }

                    // Return the data to the client
                    return data;
                });
    }
}

module.exports = CollectionApi;
