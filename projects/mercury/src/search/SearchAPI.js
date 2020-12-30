/* eslint-disable no-underscore-dangle */
import elasticsearch from "elasticsearch";

import {USER_URI, WORKSPACE_URI} from '../constants';

export const SORT_SCORE = ["_score"];

export const SEARCH_DEFAULT_SIZE = 10;

export class SearchAPI {
    constructor(client) {
        this.client = client;
    }

    /**
     * Searches ES with the qiven query string on the specified types
     * @param query
     * @param size
     * @param from
     * @param types     List of class URIs to search for. If empty, it returns all types
     * @param shared    Whether the search is for shared metadata only (true) or also for collections (false).
     * @param sort
     * @return Promise
     */
    search = ({query, size = SEARCH_DEFAULT_SIZE, from = 0, types, shared = false, sort = SORT_SCORE}) => {
        // Create basic query, excluding any deleted files
        const esQuery = {
            bool: {
                must: [{
                    query_string: {query: query || '*'}
                }],
                must_not: [{
                    exists: {
                        field: "dateDeleted"
                    }
                }, {
                    term: {
                        "type.keyword": USER_URI
                    }
                }, {
                    term: {
                        "type.keyword": WORKSPACE_URI
                    }
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
            index: shared ? 'shared' : '_all',
            body: {
                size,
                from,
                sort,
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
     * @returns {Promise}
     */
    searchLinkedData = ({types, query, size = SEARCH_DEFAULT_SIZE, page = 0, sort}) => this.search({
        query,
        size,
        types,
        from: page * size,
        shared: true,
        sort
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
        index: hit._index,
        id: hit._id,
        score: hit._score,
        highlights: hit.highlight ? Object.entries(hit.highlight)
            .filter(([key]) => !key.endsWith('.keyword')) : []
    } : {});
}

export default new SearchAPI(new elasticsearch.Client({host: window.location.origin + '/api/v1/search', log: 'error'}));
