import elasticsearch from "elasticsearch";
import Config from "./Config/Config";
import {COLLECTION_SEARCH_TYPE, COLLECTION_URI, DIRECTORY_URI, FILE_URI, FILES_SEARCH_TYPE} from '../constants';

export class SearchAPI {
    constructor(client, index) {
        this.client = client;
        this.index = index;
    }

    /**
     * Searches ES with the qiven query string on the specified types
     * @param query
     * @param types     List of class URIs to search for. If empty, it returns all types
     * @return Promise
     */
    searchForTypes = (query, types) => {
        const esQuery = {
            bool: {
                must: [{
                    query_string: {query}
                }]
            }
        };

        if (types && Array.isArray(types)) {
            esQuery.bool.filter = [
                {
                    terms: {
                        "type.keyword": types
                    }
                }
            ];
        }

        return this.client.search({
            index: this.index,
            body: {
                query: esQuery
            }
        });
    };

    searchCollections = (query) => this.searchForTypes(query, [COLLECTION_URI]);

    searchFiles = (query) => this.searchForTypes(query, [DIRECTORY_URI, FILE_URI]);

    searchAll = (query) => this.searchForTypes(query);

    /**
     * Performs a search query
     * @param type
     * @param query
     * @returns {Promise}
     */
    performSearch = (query, type) => {
        switch (type) {
            case COLLECTION_SEARCH_TYPE:
                return this.searchCollections(query);
            case FILES_SEARCH_TYPE:
                return this.searchFiles(query);
            default:
                return this.searchAll(query);
        }
    };
}

// Expose the API as a singleton.
// Please note that the client is instantiated only when needed. That way, we are
// sure that the configuration has been loaded already.
let api;
export default () => {
    if (!api) {
        api = new SearchAPI(new elasticsearch.Client(Config.get().elasticsearch));
    }

    return api;
};
