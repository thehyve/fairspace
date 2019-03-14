import elasticsearch from "elasticsearch";
import Config from "./Config/Config";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI} from '../constants';

const ES_INDEX = 'fairspace';

/* eslint-disable no-underscore-dangle */
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
        // Create basic query
        const esQuery = {
            bool: {
                must: [{
                    query_string: {query}
                }]
            }
        };

        // Add types filter, if specified
        if (types && Array.isArray(types)) {
            esQuery.bool.filter = [
                {
                    terms: {
                        "type.keyword": types
                    }
                }
            ];
        }

        // Send the query to the backend and transform the results
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
        }).then(this.transformESResult);
    };

    /**
     * Performs a search query
     * @param type
     * @param query
     * @returns {Promise}
     */
    performSearch = (query) => this.searchForTypes(query, [DIRECTORY_URI, FILE_URI, COLLECTION_URI]);

    /**
     * Transforms the search result into a format that can be used internally. The format looks like this:
     *
     * {
     *   "total": 190023,           // The total number of results for this query
     *   "items": [               // The current list of results (can be only a subset of all results)
     *      ...                     // See {transformESHit(hit)} for more details
     *   ]
     * }
     *
     * @param esJson    The json object as returned by ElasticSearch
     */
    transformESResult = (esJson) => ({
        total: esJson && esJson.hits && esJson.hits.total ? esJson.hits.total : 0,
        items: esJson && esJson.hits && esJson.hits.hits ? esJson.hits.hits.map(this.transformESHit) : []
    });

    /**
     * Transforms a hit in the search result into a format that can be used internally. The format looks like this:
     *
     *     {
     *       "_id": "...",          // The identifier for this hit. Refers to the _id field from ES
     *       "_score":  "...",      // A score for the match between the query and the result.
     *                              // See https://www.compose.com/articles/how-scoring-works-in-elasticsearch/
     *       "label": "test",       // All fields available for the search result
     *       "type": "xyz",
     *       "comment": "ajs",
     *       ...,
     *       "_highlight": {        // Information on the fragment to highlight to show where the result matched.
     *         "key": value         // The key is the field name that is matched, the value is an HTML fragment to display
     *     }                        // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-highlighting.html
     *
     * Please note that this format is not capable of returning source fields called 'id', 'score' or 'highlight'
     */
    transformESHit = (hit) => (hit ? {
        ...hit._source,
        id: hit._id,
        score: hit._score,
        highlight: hit.highlight
    } : {});
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
