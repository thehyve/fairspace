/* eslint-disable no-underscore-dangle */
import elasticsearch from "elasticsearch";

import {SEARCH_DEFAULT_SIZE} from '../common/constants';

const SORT_SCORE = ["_score"];

export const SORT_DATE_CREATED = [
    "_score",
    {
        dateCreated: {order: "desc"}
    },
];

export const SORT_ALPHABETICALLY = [
    "_score", "label.keyword", "name.keyword"
];

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
     * @param sort
     * @return Promise
     */
    search = ({query, size = SEARCH_DEFAULT_SIZE, from = 0, types, sort = SORT_SCORE}) => {
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
                }
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
            index: '_all',
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
