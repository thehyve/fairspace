import Vocabulary from './Vocabulary';
import vocabularyJsonLd from './test.vocabulary.json';

const vocabulary = new Vocabulary(vocabularyJsonLd);

describe('combination of vocabulary and metadata', () => {
    describe('vocabulary information', () => {
        it('returns the type in a proper format', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection']
            }];

            const result = vocabulary.combine(metadata);
            expect(result.map(el => el.values)).toContainEqual([{
                comment: "Collection of files with associated metadata and access rules.",
                id: "http://fairspace.io/ontology#Collection",
                label: "Collection"
            }]);
        });

        it('looks up labels in vocabulary properly', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
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

            const result = vocabulary.combine(metadata);

            expect(result.length).toBeGreaterThan(1);
            expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#comment");
            expect(result[0].label).toEqual('Description');
            expect(result[1].label).toEqual('Creator');
            expect(result[2].label).toEqual('Files in this collection');
            expect(result[3].label).toEqual('Label');
        });

        it('returns nothing without type', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                'http://www.w3.org/2000/01/rdf-schema#label': {'@value': 'Collection 1'}
            }];

            const result = vocabulary.combine(metadata);
            expect(result).toEqual([]);
        });

        it('returns an empty array when no properties are set', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
            }];

            const result = vocabulary.combine(metadata);
            expect(result).toEqual([]);
        });
    });

    describe('property values', () => {
        it('returns values in vocabulary properly', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection'],
                'http://www.w3.org/2000/01/rdf-schema#label': [{'@value': 'Collection 1'}]
            }];

            const result = vocabulary.combine(metadata);

            expect(result.length).toBeGreaterThan(1);
            expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
            expect(result[0].label).toEqual("Label");
            expect(result[0].values.length).toEqual(1);
            expect(result[0].values[0].value).toEqual('Collection 1');
        });

        it('return values if multiple types have been specified', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection', 'http://fairspace.io/ontology#Dataset'],
                'http://www.w3.org/2000/01/rdf-schema#label': [{'@value': 'Collection 1'}],
                'http://www.schema.org/creator': [{'@value': 'John Snow'}]
            }];

            const result = vocabulary.combine(metadata);

            expect(result.length).toBeGreaterThan(1);
            expect(result[0].key).toEqual("http://www.schema.org/creator");
            expect(result[0].label).toEqual("Creator");
            expect(result[0].values.length).toEqual(1);
            expect(result[0].values[0].value).toEqual('John Snow');
            expect(result[1].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
            expect(result[1].label).toEqual("Label");
            expect(result[1].values.length).toEqual(1);
            expect(result[1].values[0].value).toEqual('Collection 1');
        });

        it('returns multiple values for one predicate in vocabulary properly', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
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

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(1);
            expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#comment");
            expect(result[0].values.length).toEqual(2);
            expect(result[0].values[0].value).toEqual('My first collection');
            expect(result[0].values[1].value).toEqual('Some more info');
        });

        it('sorts values for a (set) predicate', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
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

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(1);
            expect(result[0].values[0].value).toEqual('My first collection');
            expect(result[0].values[1].value).toEqual('Some more info');
        });
    });

    describe('returned properties', () => {
        it('returns all properties specified in the vocabulary', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection']
            }];

            const result = vocabulary.combine(metadata);

            expect(result.length).toEqual(6);
            expect(result[0].key).toEqual("http://www.schema.org/creator");
            expect(result[1].key).toEqual("http://www.w3.org/2000/01/rdf-schema#comment");
            expect(result[2].key).toEqual("http://fairspace.io/ontology#hasFile");
            expect(result[3].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
            expect(result[4].key).toEqual("http://fairspace.io/ontology#list");
            expect(result[5].key).toEqual("@type");
        });

        it('sorts properties in ascending order by label with existing values first', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection'],
                'http://www.w3.org/2000/01/rdf-schema#label': [
                    {
                        '@value': 'My first collection'
                    }
                ],
                'http://www.schema.org/creator': [
                    {
                        '@value': 'Someone'
                    }
                ]
            }];

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(4);
            expect(result[0].key).toEqual("http://www.schema.org/creator");
            expect(result[1].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
            expect(result[2].key).toEqual("http://www.w3.org/2000/01/rdf-schema#comment");
            expect(result[3].key).toEqual("http://fairspace.io/ontology#hasFile");
            expect(result[4].key).toEqual("http://fairspace.io/ontology#list");
        });

        it('only returns properties present in the vocabulary', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection'],
                'http://fairspace.io/ontology#non-existing': [
                    {
                        '@value': 'My first collection'
                    }
                ]
            }];

            const result = vocabulary.combine(metadata);
            expect(result.map(property => property.key)).not.toContain('http://fairspace.io/ontology#non-existing');
        });

        it('does not return properties not allowed for a specific type', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection'],
                'http://schema.org/Creator': [
                    {
                        '@value': 'Ygritte'
                    }
                ]
            }];

            const result = vocabulary.combine(metadata);
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
            const result = vocabulary.combine(metadata);
            expect(result.length).toEqual(0);
        });

        it('includes label of associated nodes if given', () => {
            const result = vocabulary.combine(metadata, 'http://fairspace.com/iri/collections/1/dir');

            expect(result[0].key).toEqual("http://fairspace.io/ontology#hasFile");
            expect(result[0].values.length).toEqual(2);
            expect(result[0].values[0].id).toEqual('http://fairspace.com/iri/files/2');
            expect(result[0].values[0].label).toEqual("File 2");
            expect(result[0].values[1].id).toEqual('http://fairspace.com/iri/files/3');
            expect(result[0].values[1].label).toEqual(undefined);
        });
    });

    describe('getLabelForPredicate', () => {
        it('returns the label for a known predicate', () => {
            expect(vocabulary.getLabelForPredicate('http://www.w3.org/2000/01/rdf-schema#label')).toEqual('Label');
        });

        it('returns the uri if no label is known for a predicate', () => {
            const uri = 'http://fairspace.io/ontology#Unknown';
            expect(vocabulary.getLabelForPredicate(uri)).toEqual(uri);
        });

        it('returns the uri if the predicate itself is unknown', () => {
            const uri = 'http://fairspace.io/ontology#NonExisting';
            expect(vocabulary.getLabelForPredicate(uri)).toEqual(uri);
        });
    });

    describe('support for rdf:List', () => {
        it('combine returns isRdfList correctly', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection'],
                'http://fairspace.io/ontology#list': [{
                    '@list': [{"@value": "abc"}, {"@value": "def"}, {"@value": "ghi"}]
                }]
            }];

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(2);
            expect(result[0].key).toEqual('http://fairspace.io/ontology#list');
            expect(result[0].isRdfList).toEqual(true);
            expect(result[1].isRdfList).toEqual(false);
        });

        it('returns list values as arrays', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
                '@type': ['http://fairspace.io/ontology#Collection'],
                'http://fairspace.io/ontology#list': [{
                    '@list': [{"@value": "abc"}, {"@value": "def"}, {"@value": "ghi"}]
                }]
            }];

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(1);
            expect(result[0].key).toEqual('http://fairspace.io/ontology#list');
            expect(result[0].values.map(v => v.value)).toEqual(["abc", "def", "ghi"]);
        });

        it('returns concatenates multiple lists', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
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

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(1);
            expect(result[0].key).toEqual('http://fairspace.io/ontology#list');
            expect(result[0].values.map(v => v.value)).toEqual(["abc", "def", "ghi", "jkl"]);
        });

        it('does not sort values for a rdf:list predicate', () => {
            const metadata = [{
                '@id': 'http://fairspace.com/iri/collections/1',
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

            const result = vocabulary.combine(metadata);
            expect(result.length).toBeGreaterThan(1);
            expect(result[0].values.map(v => v.value)).toEqual(["jkl", "abc", "ghi", "def"]);
        });
    });
});

describe('vocabulary contains', () => {
    it('should return true if the given id is present in the vocabulary', () => expect(vocabulary.contains(vocabularyJsonLd[0]['@id'])).toBe(true));
    it('should return false if the given id is not present in the vocabulary', () => expect(vocabulary.contains('http://not-present')).toBe(false));
    it('should return false on empty vocabulary', () => expect(new Vocabulary().contains(vocabularyJsonLd[0]['@id'])).toBe(false));
    it('should return false on invalid URI', () => expect(vocabulary.contains('invalid-uri')).toBe(false));
    it('should return false on invalid parameter', () => expect(vocabulary.contains()).toBe(false));
    it('should return false if URI is only referred to in vocabulary', () => expect(vocabulary.contains('http://fairspace.io/ontology#Collection')).toBe(false));
});
