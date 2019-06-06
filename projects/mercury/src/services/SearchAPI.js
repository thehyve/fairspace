/* eslint-disable no-underscore-dangle */
import elasticsearch from "elasticsearch";

import Config from "./Config/Config";
import {
    COLLECTION_URI, DIRECTORY_URI, FILE_URI, SEARCH_DEFAULT_SIZE,
    SEARCH_MAX_SIZE
} from '../constants';

const ES_INDEX = 'fairspace';

const COLLECTION_DIRECTORIES_FILES = [DIRECTORY_URI, FILE_URI, COLLECTION_URI];

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
    search = ({query, size = SEARCH_DEFAULT_SIZE, from = 0, types, subClassOf}) => {
        // Create basic query, excluding any deleted files
        const esQuery = {
            bool: {
                must: [{
                    query_string: {query: query || '*'}
                }],
                must_not: {
                    exists: {
                        field: "dateDeleted"
                    }
                },
                filter: []
            }
        };

        // Add types filter, if specified
        if (types && Array.isArray(types)) {
            esQuery.bool.filter = [
                ...esQuery.bool.filter,
                {
                    ...esQuery.bool.filter.terms,
                    terms: {
                        "type.keyword": types
                    }
                }
            ];
        }

        if (subClassOf && Array.isArray(subClassOf)) {
            esQuery.bool.filter = [
                ...esQuery.bool.filter,
                {
                    ...esQuery.bool.filter.terms,
                    terms: {
                        "subClassOf.keyword": subClassOf
                    }
                }
            ];
        }

        // Send the query to the backend and transform the results
        return this.client.search({
            index: this.index,
            body: {
                size,
                from,
                query: esQuery,
                sort: [
                    {
                        dateCreated: {order: "desc"}
                    },
                    "_score"
                ],
                highlight: {
                    fields: {
                        "*": {}
                    }
                }
            }
        })
            .then(this.transformESResult)
            .catch((error) => {
                switch (error.status) {
                    case 400: throw new Error("Oops, we're unable to parse this query. Please only use alphanumeric characters.");
                    default: throw new Error("Error retrieving search results");
                }
            });
    };

    /**
     * @param query
     * @returns {Promise}
     */
    searchCollections = (query) => this.search({query, types: COLLECTION_DIRECTORIES_FILES, size: SEARCH_MAX_SIZE});

    /**
     * @returns {Promise}
     */
    searchLinkedData = ({types, query, size = SEARCH_DEFAULT_SIZE, page = 0}) => this.search({
        query,
        size,
        types,
        from: page * size
    });

    /**
     * @returns {Promise}
     */
    searchLinkedDataOfSubclass = ({subClassOf, query, size = SEARCH_DEFAULT_SIZE, page = 0}) => this.search({
        subClassOf,
        query,
        size,
        from: page * size
    });

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
     *                              // Only show highlights for which the key does not end in 'keyword'
     *                              // as these are mostly duplicates of the fields themselves
     *         "key": value         // The key is the field name that is matched, the value is an HTML fragment to display
     *     }                        // See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-highlighting.html
     *
     * Please note that this format is not capable of returning source fields called 'id', 'score' or 'highlight'
     */
    transformESHit = (hit) => (hit ? {
        ...hit._source,
        id: hit._id,
        score: hit._score,
        highlights: hit.highlight ? Object.entries(hit.highlight)
            .filter(([key]) => !key.endsWith('.keyword')) : []
    } : {});
}

// Expose the API as a singleton.
// Please note that the client is instantiated only when needed. That way, we are
// sure that the configuration has been loaded already.
let api;
export default () => {
    if (!api) {
        let config = Config.get().elasticsearch;

        // ES cannot handle relative urls, as it will default to localhost in that case
        if (config.host.startsWith("/")) {
            config = {
                ...config,
                host: window.location.origin + config.host
            };
        }

        api = new SearchAPI(new elasticsearch.Client(config), ES_INDEX);
    }

    return api;
};
