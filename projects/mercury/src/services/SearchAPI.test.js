import {SearchAPI} from "./SearchAPI";
import {COLLECTION_URI, DIRECTORY_URI, FILE_URI, SEARCH_MAX_SIZE} from "../constants";

let mockClient;
let searchAPI;

describe('Search API', () => {
    beforeEach(() => {
        mockClient = {
            search: jest.fn(() => Promise.resolve({hits: {total: 0, hits: []}}))
        };
        searchAPI = new SearchAPI(mockClient);
    });

    it('forwards the collections search query to ES', () => searchAPI.searchCollections('my-query')
        .then(() => {
            expect(mockClient.search.mock.calls.length).toEqual(1);
            expect(mockClient.search.mock.calls[0][0].body.query.bool.must[0].query_string.query).toEqual('my-query');
        }));

    it('filters deleted entities from ES results', () => searchAPI.searchCollections('my-query')
        .then(() => {
            expect(mockClient.search.mock.calls.length).toEqual(1);
            expect(mockClient.search.mock.calls[0][0].body.query.bool.must_not.exists.field).toEqual(
                "dateDeleted"
            );
        }));

    it('filters ES results based on types', () => searchAPI.searchCollections('my-query')
        .then(() => {
            expect(mockClient.search.mock.calls.length).toEqual(1);
            expect(mockClient.search.mock.calls[0][0].body.query.bool.filter[0].terms['type.keyword']).toEqual(
                expect.arrayContaining([FILE_URI, COLLECTION_URI, DIRECTORY_URI])
            );
        }));

    describe('output format', () => {
        it('transforms results from ES into the right output format', () => {
            const esResult = {
                took: 6,
                timed_out: false,
                _shards: {},
                hits: {
                    total: 123,
                    hits: [
                        {
                            _index: "fairspace",
                            _type: "iri",
                            _id: "http://fairspace.io/iri/0df9a97a-45aa-9a98-b428-2ba35bd61c2c",
                            _score: 4.59,
                            _source: {
                                label: "update.txt"
                            },
                            highlight: {
                                label: [
                                    "<em>update</em>.txt"
                                ]
                            }
                        }
                    ]
                }
            };

            mockClient.search = jest.fn(() => Promise.resolve(esResult));
            return searchAPI.searchCollections()
                .then(result => {
                    expect(result.total).toEqual(123);
                    expect(result.items.length).toEqual(1);
                    expect(result.items[0]).toEqual({
                        label: "update.txt",
                        id: "http://fairspace.io/iri/0df9a97a-45aa-9a98-b428-2ba35bd61c2c",
                        score: 4.59,
                        highlights: [['label', ["<em>update</em>.txt"]]]

                    });
                });
        });

        describe('full es transformation', () => {
            it('returns total number of results', () => {
                expect(searchAPI.transformESResult({hits: {total: 219381, hits: []}}).total).toEqual(219381);
            });

            it('ignores other properties in the ES result', () => {
                expect(searchAPI.transformESResult({noData: "fake", hits: {otherData: "fake", total: 219381, hits: []}}))
                    .toEqual({
                        total: 219381,
                        items: []
                    });
            });

            it('handles missing values gracefully', () => {
                expect(searchAPI.transformESResult({})).toEqual({total: 0, items: []});
                expect(searchAPI.transformESResult()).toEqual({total: 0, items: []});
            });
        });
        describe('es hit transformation', () => {
            it('adds all source properties as-is', () => {
                const transformedHit = searchAPI.transformESHit({
                    _source: {
                        label: "text",
                        numberList: [4]
                    }
                });

                expect(transformedHit.label).toEqual("text");
                expect(transformedHit.numberList).toEqual([4]);
            });
            it('adds id, score and highlight', () => {
                const transformedHit = searchAPI.transformESHit({
                    _id: "special-id",
                    _score: 4.23,
                    highlight: {
                        label: ["some-html"]
                    },
                    _source: {}
                });

                expect(transformedHit.id).toEqual("special-id");
                expect(transformedHit.score).toEqual(4.23);
                expect(transformedHit.highlights).toEqual([['label', ["some-html"]]]);
            });
            it('overwrites id, score and highlight in source properties', () => {
                const transformedHit = searchAPI.transformESHit({
                    _id: "special-id",
                    _score: 4.23,
                    highlight: {
                        label: ["some-html"]
                    },
                    _source: {
                        id: "overwritten",
                        score: "overwritten",
                        highlight: "overwritten",
                        label: "not-overwritten"
                    }
                });

                expect(transformedHit.id).toEqual("special-id");
                expect(transformedHit.score).toEqual(4.23);
                expect(transformedHit.highlights).toEqual([["label", ["some-html"]]]);
                expect(transformedHit.label).toEqual("not-overwritten");
            });
            it('handles missing values gracefully', () => {
                expect(searchAPI.transformESHit({})).toEqual({highlights: []});
                expect(searchAPI.transformESHit()).toEqual({});
            });

            it('Handles highlights properly', () => {
                const transformedHit = searchAPI.transformESHit({
                    _index: "fairspace",
                    _type: "iri",
                    _id: "http://localhost/iri/PERSON",
                    _score: 1.2039728,
                    _source: {
                        label: [
                            "Mo"
                        ],
                        type: [
                            "http://xmlns.com/foaf/0.1/Person"
                        ],
                        dateCreated: [
                            "2019-05-24T08:43:35.309Z"
                        ],
                        createdBy: [
                            "http://localhost/iri/6e6cde34-45bc-42d8-8cdb-b6e9faf890d3"
                        ],
                        comment: [
                            "Mohammad"
                        ]
                    },
                    highlight: {
                        "type.keyword": [
                            "<em>http://xmlns.com/foaf/0.1/Person</em>"
                        ],
                        "label": [
                            "<em>Mo</em>"
                        ]
                    }
                });
                expect(transformedHit.highlights).toEqual([["label", ["<em>Mo</em>"]]]);
            });
        });
    });

    it('forwards the metadata search query to ES', () => {
        const types = ["http://localhost/vocabulary/Analysis", "http://osiris.fairspace.io/ontology#BiologicalSample"];
        searchAPI.searchLinkedData(types, 'my-query')
            .then(() => {
                expect(mockClient.search.mock.calls.length)
                    .toEqual(1);

                expect(mockClient.search.mock.calls[0][0].body.size)
                    .toEqual(SEARCH_MAX_SIZE);

                expect(mockClient.search.mock.calls[0][0].body.query.bool.must[0].query_string.query)
                    .toEqual('my-query');

                expect(mockClient.search.mock.calls[0][0].body.query.bool.filter[0].terms['type.keyword'])
                    .toEqual(
                        expect.arrayContaining(types)
                    );
            });
    });

    it('searchs all metadata when no query is given', () => {
        const types = ["http://localhost/vocabulary/Analysis", "http://osiris.fairspace.io/ontology#BiologicalSample"];
        searchAPI.searchLinkedData(types)
            .then(() => {
                expect(mockClient.search.mock.calls.length)
                    .toEqual(1);

                expect(mockClient.search.mock.calls[0][0].body.size)
                    .toEqual(SEARCH_MAX_SIZE);

                expect(mockClient.search.mock.calls[0][0].body.query.bool.must[0].query_string.query)
                    .toEqual('*');

                expect(mockClient.search.mock.calls[0][0].body.query.bool.filter[0].terms['type.keyword'])
                    .toEqual(
                        expect.arrayContaining(types)
                    );
            });
    });
});
