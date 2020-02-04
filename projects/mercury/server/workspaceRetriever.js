const elasticsearch = require('elasticsearch');

const transformESHit = (hit) => (hit ? {
    ...hit._source,
    index: hit._index,
    id: hit._id,
    score: hit._score,
} : {});

const transformESResult = (esJson) => (
    esJson && esJson.hits && esJson.hits.hits ? esJson.hits.hits.map(transformESHit) : []
);

const mapWorkspaceSearchItems = (items) => {
    const result = transformESResult(items);
    return result.map(item => ({
        id: item.index,
        node: item.nodeUrl.find(() => true),
        label: item.label.find(() => true),
        description: item.workspaceDescription.find(() => true)
    }));
};


const sortDataCreated = [
    "_score",
    {
        dateCreated: {order: "desc"}
    }
];

const esQuery = {
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
};

const workspaceRetriever = (host) => {
    const esClient = new elasticsearch.Client({host, log: 'error'});

    return () => esClient.search({
        index: "_all",
        body: {
            size: 10000,
            from: 0,
            sort: sortDataCreated,
            query: esQuery,
            highlight: {
                fields: {
                    "*": {}
                }
            }
        }
    }).then(mapWorkspaceSearchItems);
};

module.exports = workspaceRetriever;
