import Vocabulary from './Vocabulary';
import {
    DOMAIN_URI, LABEL_URI, PROPERTY_URI, RANGE_URI
} from "./MetadataAPI";

const vocabularyJsonLd = [
    {
        "@id": "@type",
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Type'}],
        [DOMAIN_URI]: [
            {"@id": "http://fairspace.io/ontology#Collection"}
        ]
    },
    {
        '@id': 'http://www.w3.org/2000/01/rdf-schema#label',
        '@type': [PROPERTY_URI],
        [LABEL_URI]: [{'@value': 'Name'}],
        [DOMAIN_URI]: [{'@id': 'http://fairspace.io/ontology#Collection'}]
    },
    {
        '@id': 'http://fairspace.io/ontology#description',
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Description'}],
        [DOMAIN_URI]: [{'@id': 'http://fairspace.io/ontology#Collection'}]
    },
    {
        '@id': 'http://fairspace.io/ontology#contains',
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Contains'}],
        [DOMAIN_URI]: [{'@id': 'http://fairspace.io/ontology#Directory'}],
        [RANGE_URI]: [{'@id': 'http://fairspace.io/ontology#File'}]
    },
    {
        '@id': 'http://schema.org/Creator',
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Creator'}],
        [DOMAIN_URI]: [{'@id': 'http://fairspace.io/ontology#Dataset'}]
    },
    {
        '@id': 'http://schema.org/CreatedDate',
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Created date'}],
        [DOMAIN_URI]: [{'@id': 'http://fairspace.io/ontology#Collection'}]
    },
    {
        '@id': 'http://fairspace.io/ontology#Collection',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class',
        [LABEL_URI]: [{'@value': 'Collection'}]
    },
    {
        '@id': 'http://fairspace.io/ontology#Dataset',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class',
        [LABEL_URI]: [{'@value': 'Dataset'}]
    },
    {
        '@id': 'http://fairspace.io/ontology#File',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class',
        [LABEL_URI]: [{'@value': 'File'}]
    }
];
const vocabulary = new Vocabulary(vocabularyJsonLd);

describe('combination of vocabulary and metadata', () => {
    it('returns an empty array when no properties are set', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
        }];

        const result = vocabulary.combine(metadata);
        expect(result).toEqual([]);
    });

    it('returns the type in a proper format', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection']
        }];

        const result = vocabulary.combine(metadata);
        expect(result.length).toEqual(4);
        expect(result[0].key).toEqual("@type");
        expect(result[0].label).toEqual("Type");
        expect(result[0].values.length).toEqual(1);
        expect(result[0].values[0].id).toEqual('http://fairspace.io/ontology#Collection');
        expect(result[0].values[0].label).toEqual('Collection');
        expect(result[1].values.length).toEqual(0);
        expect(result[2].values.length).toEqual(0);
        expect(result[3].values.length).toEqual(0);
    });

    it('returns nothing without type', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            'http://www.w3.org/2000/01/rdf-schema#label': {'@value': 'Collection 1'}
        }];

        const result = vocabulary.combine(metadata);
        expect(result).toEqual([]);
    });

    it('returns values in vocabulary properly', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection'],
            'http://www.w3.org/2000/01/rdf-schema#label': [{'@value': 'Collection 1'}]
        }];

        const result = vocabulary.combine(metadata);

        expect(result.length).toEqual(4);
        expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
        expect(result[0].label).toEqual("Name");
        expect(result[0].values.length).toEqual(1);
        expect(result[0].values[0].value).toEqual('Collection 1');

        expect(result[2].values.length).toEqual(0);
        expect(result[3].values.length).toEqual(0);
    });

    it('return values if multiple types have been specified', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection', 'http://fairspace.io/ontology#Dataset'],
            'http://www.w3.org/2000/01/rdf-schema#label': [{'@value': 'Collection 1'}],
            'http://schema.org/Creator': [{'@value': 'John Snow'}]
        }];

        const result = vocabulary.combine(metadata);

        expect(result.length).toEqual(5);
        expect(result[0].key).toEqual("http://schema.org/Creator");
        expect(result[0].label).toEqual("Creator");
        expect(result[0].values.length).toEqual(1);
        expect(result[0].values[0].value).toEqual('John Snow');
        expect(result[1].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
        expect(result[1].label).toEqual("Name");
        expect(result[1].values.length).toEqual(1);
        expect(result[1].values[0].value).toEqual('Collection 1');
    });

    it('looks up labels in vocabulary properly', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection'],
            'http://fairspace.io/ontology#description': [
                {
                    '@value': 'My first collection'
                },
                {
                    '@value': 'Some more info'
                }
            ]
        }];

        const result = vocabulary.combine(metadata);

        expect(result.length).toEqual(4);
        expect(result[0].key).toEqual("http://fairspace.io/ontology#description");
        expect(result[0].label).toEqual('Description');
        expect(result[1].label).toEqual('Type');
        expect(result[2].label).toEqual('Created date');
        expect(result[3].label).toEqual('Name');
    });

    it('returns multiple values for one predicate in vocabulary properly', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection'],
            'http://fairspace.io/ontology#description': [
                {
                    '@value': 'My first collection'
                },
                {
                    '@value': 'Some more info'
                }
            ]
        }];

        const result = vocabulary.combine(metadata);
        expect(result.length).toEqual(4);
        expect(result[0].key).toEqual("http://fairspace.io/ontology#description");
        expect(result[0].values.length).toEqual(2);
        expect(result[0].values[0].value).toEqual('My first collection');
        expect(result[0].values[1].value).toEqual('Some more info');

        expect(result[2].values.length).toEqual(0);
        expect(result[3].values.length).toEqual(0);
    });

    it('sorts properties in ascending order by label', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection'],
            'http://www.w3.org/2000/01/rdf-schema#label': [
                {
                    '@value': 'My first collection'
                }
            ],
            'http://schema.org/CreatedDate': [
                {
                    '@value': 'yesterday'
                }
            ]
        }];

        const result = vocabulary.combine(metadata);
        expect(result.length).toEqual(4);
        expect(result[0].key).toEqual("http://schema.org/CreatedDate");
        expect(result[1].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
        expect(result[2].key).toEqual("@type");

        expect(result[3].values.length).toEqual(0);
    });

    it('only returns properties in the vocabulary', () => {
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
        expect(result.length).toEqual(4);
        expect(result.map(property => property.key)).not.toContain('http://fairspace.io/ontology#non-existing');
    });

    it('adds all properties allowed for the specific type', () => {
        const metadata = [{
            '@id': 'http://fairspace.com/iri/collections/1',
            '@type': ['http://fairspace.io/ontology#Collection'],
            'http://www.w3.org/2000/01/rdf-schema#label': [
                {
                    '@value': 'My first collection'
                }
            ]
        }];

        const result = vocabulary.combine(metadata);
        expect(result.length).toEqual(4);
        expect(result[0].key).toEqual("http://www.w3.org/2000/01/rdf-schema#label");
        expect(result[1].key).toEqual("@type");
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
        expect(result.length).toEqual(4);
        expect(result.map(property => property.key)).not.toContain('http://schema.org/Creator');
    });


    describe('multiple entities', () => {
        const metadata = [
            {
                '@id': 'http://fairspace.com/iri/collections/1/dir',
                '@type': ['http://fairspace.io/ontology#Directory'],
                "http://fairspace.io/ontology#contains": [
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

            expect(result[0].key).toEqual("http://fairspace.io/ontology#contains");
            expect(result[0].values.length).toEqual(2);
            expect(result[0].values[0].id).toEqual('http://fairspace.com/iri/files/2');
            expect(result[0].values[0].label).toEqual("File 2");
            expect(result[0].values[1].id).toEqual('http://fairspace.com/iri/files/3');
            expect(result[0].values[1].label).toEqual(undefined);
        });
    });
});
