import elasticsearch from "elasticsearch";
import Config from "./Config/Config";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from '../constants';

const ES_INDEX = 'fairspace';

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
                query: esQuery,
                highlight: {
                    fields: {
                        "*": {}
                    }
                }
            }
        });
    };

    /**
     * Performs a search query
     * @param type
     * @param query
     * @returns {Promise}
     */
    performSearch = (query) => {
        return this.searchForTypes(query, [DIRECTORY_URI, FILE_URI, COLLECTION_URI]);
    };
}

// Expose the API as a singleton.
// Please note that the client is instantiated only when needed. That way, we are
// sure that the configuration has been loaded already.
let api;
export default () => {
    if (!api) {
        api = new SearchAPI(new elasticsearch.Client(Config.get().elasticsearch), ES_INDEX);
    }

    return api;
};
