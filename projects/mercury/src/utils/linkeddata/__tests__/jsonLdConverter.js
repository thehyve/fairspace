import * as constants from "../../../constants";
import {emptyLinkedData, fromJsonLd, normalizeTypes, toJsonLd} from "../jsonLdConverter";
import {vocabularyUtils} from "../vocabularyUtils";
import vocabularyJsonLd from "../test.vocabulary";

describe('jsonLdConverter', () => {
    describe('fromJsonLd', () => {
        const vocabulary = vocabularyUtils(vocabularyJsonLd);
        const subject = 'http://fairspace.com/iri/collections/1';

        describe('vocabulary information', () => {
            it('returns the type in a proper format', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection']
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.map(el => el.values)).toContainEqual([{
                    comment: "Collection of files with associated metadata and access rules.",
                    id: "http://fairspace.io/ontology#Collection",
                    label: "Collection"
                }]);
            });

            it('looks up labels in vocabulary properly', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://www.w3.org/2000/01/rdf-schema#comment': [
                        {
                            '@value': 'My first collection'
                        },
                        {
                            '@value': 'Some more info'
                        }
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);

                expect(result.length).toBeGreaterThan(1);
                expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#comment");
                expect(result.map(entry => entry.label)).toEqual(
                    expect.arrayContaining(['Creator', 'Description', 'Files in this collection', 'Label', 'List', 'Type'])
                );
            });

            it('returns nothing without type', () => {
                const metadata = [{
                    '@id': subject,
                    'http://www.w3.org/2000/01/rdf-schema#label': {'@value': 'Collection 1'}
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result).toEqual([]);
            });

            it('returns an empty array when no properties are set', () => {
                const metadata = [{
                    '@id': subject,
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result).toEqual([]);
            });
        });

        describe('property values', () => {
            it('returns values in vocabulary properly', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://www.w3.org/2000/01/rdf-schema#label': [{'@value': 'Collection 1'}]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);

                expect(result.length).toBeGreaterThan(1);
                expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
                expect(result[0].label).toEqual("Label");
                expect(result[0].values.length).toEqual(1);
                expect(result[0].values[0].value).toEqual('Collection 1');
            });

            it('return values if multiple types have been specified', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection', 'http://fairspace.io/ontology#Dataset'],
                    'http://www.w3.org/2000/01/rdf-schema#label': [{'@value': 'Collection 1'}],
                    'http://www.schema.org/creator': [{'@value': 'John Snow'}]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);

                expect(result.length).toBeGreaterThan(1);
                expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
                expect(result[0].label).toEqual("Label");
                expect(result[0].values.length).toEqual(1);
                expect(result[0].values[0].value).toEqual('Collection 1');
                expect(result[1].key).toEqual("http://www.schema.org/creator");
                expect(result[1].label).toEqual("Creator");
                expect(result[1].values.length).toEqual(1);
                expect(result[1].values[0].value).toEqual('John Snow');
            });

            it('returns multiple values for one predicate in vocabulary properly', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://www.w3.org/2000/01/rdf-schema#comment': [
                        {
                            '@value': 'My first collection'
                        },
                        {
                            '@value': 'Some more info'
                        }
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toBeGreaterThan(1);
                expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#comment");
                expect(result[0].values.length).toEqual(2);
                expect(result[0].values[0].value).toEqual('My first collection');
                expect(result[0].values[1].value).toEqual('Some more info');
            });

            it('sorts values for a (set) predicate', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://www.w3.org/2000/01/rdf-schema#comment': [
                        {
                            '@value': 'Some more info'
                        },
                        {
                            '@value': 'My first collection'
                        }
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toBeGreaterThan(1);
                expect(result[0].values[0].value).toEqual('My first collection');
                expect(result[0].values[1].value).toEqual('Some more info');
            });
        });

        describe('returned properties', () => {
            it('returns all properties specified in the vocabulary', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection']
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);

                expect(result.length).toEqual(6);
                expect(result.map(entry => entry.key)).toEqual(
                    expect.arrayContaining([
                        "@type",
                        "http://fairspace.io/ontology#hasFile",
                        "http://fairspace.io/ontology#list",
                        "http://www.schema.org/creator",
                        "http://www.w3.org/2000/01/rdf-schema#comment",
                        "http://www.w3.org/2000/01/rdf-schema#label"
                    ])
                );
            });

            it('only returns properties present in the vocabulary', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://fairspace.io/ontology#non-existing': [
                        {
                            '@value': 'My first collection'
                        }
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.map(property => property.key)).not.toContain('http://fairspace.io/ontology#non-existing');
            });

            it('does not return properties not allowed for a specific type', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://schema.org/Creator': [
                        {
                            '@value': 'Ygritte'
                        }
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.map(property => property.key)).not.toContain('http://schema.org/Creator');
            });
        });

        describe('multiple entities', () => {
            const metadata = [
                {
                    '@id': 'http://fairspace.com/iri/collections/1/dir',
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    "http://fairspace.io/ontology#hasFile": [
                        {
                            "@id": "http://fairspace.com/iri/files/2"
                        },
                        {
                            "@id": "http://fairspace.com/iri/files/3"
                        }
                    ]
                },
                {
                    '@id': 'http://fairspace.com/iri/files/2',
                    '@type': ['http://fairspace.io/ontology#File'],
                    "http://www.w3.org/2000/01/rdf-schema#label": [{"@value": "File 2"}]
                }
            ];

            it('returns nothing if multiple nodes are given but no subject', () => {
                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toEqual(0);
            });

            it('includes label of associated nodes if given', () => {
                const result = fromJsonLd(metadata, 'http://fairspace.com/iri/collections/1/dir', vocabulary);

                expect(result[0].key).toEqual("http://fairspace.io/ontology#hasFile");
                expect(result[0].values.length).toEqual(2);
                expect(result[0].values[0].id).toEqual('http://fairspace.com/iri/files/2');
                expect(result[0].values[0].label).toEqual("File 2");
                expect(result[0].values[1].id).toEqual('http://fairspace.com/iri/files/3');
                expect(result[0].values[1].label).toEqual(undefined);
            });
        });

        describe('support for rdf:List', () => {
            it('fromJsonLd returns isRdfList correctly', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://fairspace.io/ontology#list': [{
                        '@list': [{"@value": "abc"}, {"@value": "def"}, {"@value": "ghi"}]
                    }]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toBeGreaterThan(2);
                expect(result[0].key).toEqual('http://fairspace.io/ontology#list');
                expect(result[0].isRdfList).toEqual(true);
                expect(result[1].isRdfList).toEqual(false);
            });

            it('returns list values as arrays', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://fairspace.io/ontology#list': [{
                        '@list': [{"@value": "abc"}, {"@value": "def"}, {"@value": "ghi"}]
                    }]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toBeGreaterThan(1);
                expect(result[0].key).toEqual('http://fairspace.io/ontology#list');
                expect(result[0].values.map(v => v.value)).toEqual(["abc", "def", "ghi"]);
            });

            it('returns concatenates multiple lists', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://fairspace.io/ontology#list': [
                        {
                            '@list': [{"@value": "abc"}, {"@value": "def"}]
                        },
                        {
                            '@list': [{"@value": "ghi"}, {"@value": "jkl"}]
                        },
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toBeGreaterThan(1);
                expect(result[0].key).toEqual('http://fairspace.io/ontology#list');
                expect(result[0].values.map(v => v.value)).toEqual(["abc", "def", "ghi", "jkl"]);
            });

            it('does not sort values for a rdf:list predicate', () => {
                const metadata = [{
                    '@id': subject,
                    '@type': ['http://fairspace.io/ontology#Collection'],
                    'http://fairspace.io/ontology#list': [
                        {
                            '@list': [{"@value": "jkl"}, {"@value": "abc"}]
                        },
                        {
                            '@list': [{"@value": "ghi"}, {"@value": "def"}]
                        },
                    ]
                }];

                const result = fromJsonLd(metadata, subject, vocabulary);
                expect(result.length).toBeGreaterThan(1);
                expect(result[0].values.map(v => v.value)).toEqual(["jkl", "abc", "ghi", "def"]);
            });
        });
    });

    describe('toJsonLd', () => {
        const vocabulary = vocabularyUtils([]);

        it('should creates a valid json-ld (@value)', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const values = [{value: "some-value"}];

            const jsonLd = toJsonLd(subject, predicate, values, vocabulary);

            const expected = {
                "@id": "some-subject",
                "some-predicate": [{"@value": "some-value"}]
            };

            expect(jsonLd).toEqual(expected);
        });

        it('should creates a valid json-ld (@id)', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const values = [{id: "some-id"}];

            const jsonLd = toJsonLd(subject, predicate, values, vocabulary);

            const expected = {
                "@id": "some-subject",
                "some-predicate": [{"@id": "some-id"}]
            };

            expect(jsonLd).toEqual(expected);
        });

        it('returns null if no valid predicate is provided', () => {
            const subject = "some-subject";
            const values = [{id: "some-id"}];
            const jsonLd = toJsonLd(subject, null, values, vocabulary);

            expect(jsonLd).toEqual(null);
        });

        it('returns null if no valid values are provided', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const jsonLd = toJsonLd(subject, predicate, null, vocabulary);

            expect(jsonLd).toEqual(null);
        });

        it('serializes a an empty list as fs:NIL', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const jsonLd = toJsonLd(subject, predicate, [], vocabulary);

            const expected = {
                "@id": "some-subject",
                [predicate]: {'@id': constants.NIL_URI}
            };

            expect(jsonLd).toEqual(expected);
        });

        it('serializes a list with only empty values as fs:NIL', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const values = [{value: ''}, {value: undefined}, {value: null}];
            const jsonLd = toJsonLd(subject, predicate, values, vocabulary);

            const expected = {
                "@id": "some-subject",
                [predicate]: {'@id': constants.NIL_URI}
            };

            expect(jsonLd).toEqual(expected);
        });

        it('filters out invalid values', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const values = [{value: ''}, {value: undefined}, {value: null}, {value: 'some-value'}, {value: 'some-other-value'}];
            const jsonLd = toJsonLd(subject, predicate, values, vocabulary);

            const expected = {
                "@id": "some-subject",
                "some-predicate": [{"@value": "some-value"}, {"@value": "some-other-value"}]
            };

            expect(jsonLd).toEqual(expected);
        });

        it('returns null if no valid subject is provided', () => {
            const predicate = "some-predicate";
            const values = [{id: "some-id"}];
            const jsonLd = toJsonLd(null, predicate, values, vocabulary);

            expect(jsonLd).toEqual(null);
        });

        it('return null if no parameters are sent', () => {
            const jsonLd = toJsonLd();

            expect(jsonLd).toEqual(null);
        });

        it('should generate a valid json-ld for rdf:List', () => {
            const subject = "some-subject";
            const predicate = "some-predicate";
            const values = [{value: "some-value"}, {value: "some-other-value"}];

            const vocabularyMock = {
                determineShapeForProperty: () => ({
                    [constants.SHACL_NODE]: [{'@id': constants.DASH_LIST_SHAPE}]
                })
            };

            const jsonLd = toJsonLd(subject, predicate, values, vocabularyMock);

            const expected = {
                "@id": "some-subject",
                "some-predicate": {"@list": [{"@value": "some-value"}, {"@value": "some-other-value"}]}
            };

            expect(jsonLd).toEqual(expected);
        });
    });

    describe('empty linked data object', () => {
        const vocabulary = vocabularyUtils(vocabularyJsonLd);

        it('returns all properties without values', () => {
            const shape = vocabulary.determineShapeForTypes(['http://fairspace.io/ontology#Collection']);
            const result = emptyLinkedData(vocabulary, shape);

            expect(result.length).toEqual(6);

            expect(result[0].values).toEqual([]);
            expect(result[1].values).toEqual([]);
            expect(result[2].values).toEqual([]);
            expect(result[3].values).toEqual([]);
            expect(result[4].values).toEqual([]);
        });

        it('returns the type property with value', () => {
            const shape = vocabulary.determineShapeForTypes(['http://fairspace.io/ontology#Collection']);
            const result = emptyLinkedData(vocabulary, shape);

            expect(result.length).toEqual(6);
            expect(result[5].values.map(el => el.id)).toEqual(['http://fairspace.io/ontology#Collection']);
        });

        it('returns nothing for an invalid shape', () => {
            expect(emptyLinkedData(vocabulary)).toEqual([]);
        });

        it('returns nothing for an invalid vocabulary', () => {
            expect(emptyLinkedData(vocabulary)).toEqual([]);
        });
    });

    describe('normalizeTypes', () => {
        it('replaces rdf:type with @type', () => {
            const result = normalizeTypes([
                { '@id': 'http://example.com/1',  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [{'@id': 'http://example.com/Type'}]},
                { '@id': 'http://example.com/2',  '@type': ['http://example.com/Type']},
                { '@id': 'http://example.com/2',  'http://example.com/property': [123]}
            ]);

            expect(result).toEqual([
                { '@id': 'http://example.com/1',  '@type': ['http://example.com/Type']},
                { '@id': 'http://example.com/2',  '@type': ['http://example.com/Type']},
                { '@id': 'http://example.com/2',  'http://example.com/property': [123]}
            ]);
        })
    })
});
