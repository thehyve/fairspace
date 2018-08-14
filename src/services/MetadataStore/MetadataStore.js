import Config from "../../components/generic/Config/Config";

function failOnHttpError(response, message) {
    if(!response.ok) {
        throw Error(message, response.error);
    }
}

class MetadataStore {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});
    static getHeaders = new Headers({'Accept': 'application/json'});

    constructor() {
        this.collectionsBackendUrl = '/metadata/collections';
    }

    init() {
        return Config.waitFor().then(() => {
            this.collectionMetadataUrlPattern = Config.get().metadata.urlPatterns.collections;
        });
    }

    /**
     * Stores collection metadata
     * @param collection Object with collection metadata. At least an id should be present. Currently the fields
     *                   name and description are supported in the backend
     * @returns {Promise<Response>}
     */
    addCollectionMetadata(collection) {
        if(!collection || !collection.name) {
            return Promise.reject("No proper collection provided.");
        }

        let body = Object.assign({}, collection, {
            "uri": this.createUri(collection.name)
        });

        return fetch(this.collectionsBackendUrl, {
            method: 'POST',
            headers: MetadataStore.changeHeaders,
            credentials: "same-origin",
            body: JSON.stringify(body)
        }).then((response) => {
            failOnHttpError(response, "Failure when adding collection to the metadata store");

            return response;
        });
    }

    /**
     * Updates collection metadata
     * @param collection Object with collection metadata. At least an id should be present. Currently the fields
     *                   name and description are supported in the backend
     * @returns {Promise<Response>}
     */
    updateCollectionMetadata(collection) {
        if(!collection || !collection.name) {
            return Promise.reject("No proper collection provided.");
        }

        let body = Object.assign({}, collection, {
            "uri": this.createUri(collection.name)
        });

        return fetch(this.collectionsBackendUrl, {
            method: 'PATCH',
            headers: MetadataStore.changeHeaders,
            credentials: "same-origin",
            body: JSON.stringify(body)
        }).then((response) => {
            failOnHttpError(response, "Failure when updating collection in the metadata store");

            return response;
        });
    }

    /**
     * Retrieves collection metadata
     * @param collectionIds     The ids to retrieve metadata for.
     * @returns {Promise<any>}  A promise that resolves with list of collections including metadata
     */
    getCollectionMetadata(collectionIds) {
        return fetch(this.collectionsBackendUrl, {
            method: 'GET',
            headers: MetadataStore.getHeaders,
            credentials: "same-origin"
        }).then((response) => {
            // If an error occurs, return some info to the user as a fallback
            if(!response.ok) {
                console.error("Failure when retrieving collection metadata", response.status);
                return collectionIds.map((id) => { return {uri: this.createUri(id), name: id, error: true}; } );
            }

            return response.json();
        }).then(json => {
            // Create a map of urls mapping to ids
            let uriToIdMap = collectionIds.reduce((map, id) => {
                map[this.createUri(id)] = id;
                return map;
            }, {});

            // For all metadata, see if it is asked for. If so,
            // store in the return map
            return json
                .filter((collectionMetadata) => uriToIdMap.hasOwnProperty(collectionMetadata.uri))
                .map((collectionMetadata) => Object.assign(collectionMetadata, { id: uriToIdMap[collectionMetadata.uri] }));
        });
    }

    /**
     * Creates a URI from a given collection ID, according to the convention
     * @param id
     * @returns {*}
     */
    createUri(id) {
        return this.collectionMetadataUrlPattern.replace('{id}', id)
    }
}

export default new MetadataStore();