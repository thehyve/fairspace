const elasticsearch = require('elasticsearch');

const EXCLUDED_SEARCH_TYPES = [
    "http://fairspace.io/ontology#User",
    "http://fairspace.io/ontology#File",
    "http://fairspace.io/ontology#Collection",
    "http://fairspace.io/ontology#Directory"
];

const SORT_DATE_CREATED = [
    "_score",
    {
        dateCreated: {order: "desc"}
    }
];

class ElasticsearchClient {
    constructor(host) {
        this.client = new elasticsearch.Client({host, log: 'error'});
    }

    transformESHit(hit) {
        return hit ? {
            ...hit._source,
            index: hit._index,
            id: hit._id,
            score: hit._score,
        } : {};
    }

    transformESResult(esJson) {
        return esJson && esJson.hits && esJson.hits.hits ? esJson.hits.hits.map(this.transformESHit) : [];
    }

    transformESAggregates(esJson) {
        return esJson && esJson.aggregations
        && esJson.aggregations.typeAggregations
        && esJson.aggregations.typeAggregations.buckets
            ? esJson.aggregations.typeAggregations.buckets.map(b => b.key) : [];
    }

    mapWorkspaceSearchItems(items) {
        const result = this.transformESResult(items);
        return result.map(item => ({
            id: item.index,
            node: item.nodeUrl.find(() => true),
            label: item.label.find(() => true),
            description: item.workspaceDescription.find(() => true)
        }));
    }

    mapCrossWorkspaceSearchItems(items) {
        const result = this.transformESResult(items);

        const getLabel = (item) => {
            if (item.label) {
                return item.label.find(() => true);
            }
            if (item.name) {
                return item.name.find(() => true);
            }
            return null;
        };

        return result.map(item => ({
            id: item.id,
            index: item.index,
            type: item.type.find(() => true),
            label: getLabel(item)
        }));
    }

    retrieveWorkspaces() {
        return this.client.search({
            index: "_all",
            body: {
                size: 10000,
                from: 0,
                sort: SORT_DATE_CREATED,
                query: {
                    bool: {
                        must: [{
                            query_string: {query: '*'}
                        }],
                        must_not: {
                            exists: {
                                field: "dateDeleted"
                            }
                        },
                        filter: [
                            {
                                terms: {
                                    "type.keyword": ["http://fairspace.io/ontology#Workspace"]
                                }
                            }
                        ]
                    }
                },
                highlight: {
                    fields: {
                        "*": {}
                    }
                }
            }
        }).then(items => this.mapWorkspaceSearchItems(items));
    }

    retrieveSearchTypes() {
        return this.client.search({
            index: "_all",
            body: {
                query: {
                    bool: {
                        must_not: {
                            terms: {
                                "type.keyword": EXCLUDED_SEARCH_TYPES
                            }
                        }
                    }
                },
                aggs: {
                    typeAggregations: {
                        terms: {field: "type.keyword", size: 10000}
                    }
                },
                size: 0
            }
        }).then(items => this.transformESAggregates(items));
    }

    crossWorkspacesSearch(query, types) {
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
                filter: [
                    {
                        terms: {
                            "type.keyword": types
                        }
                    }
                ]
            }
        };
        return this.client.search({
            index: "_all",
            body: {
                size: 10000,
                from: 0,
                sort: SORT_DATE_CREATED,
                query: esQuery,
                highlight: {
                    fields: {
                        "*": {}
                    }
                }
            }
        }).then(items => this.mapCrossWorkspaceSearchItems(items));
    }
}

module.exports = ElasticsearchClient;
