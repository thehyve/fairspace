import combine from './MetadataUtils';

const metadata1 = [
    {
        '@id': 'http://fairspace.com/iri/collections/1',
        '@type': [
            'http://fairspace.io/ontology#Collection'
        ],
        'http://fairspace.io/ontology#description': [
            {
                '@value': 'My first collection'
            },
            {
                '@value': 'More info'
            }
        ],
        'http://fairspace.io/ontology#name': [
            {
                '@value': 'Collection 5'
            }
        ]
    }
];

const vocabulary = [
    {
        '@id': 'http://fairspace.io/ontology#name',
        '@type': [
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
        ],
        'http://www.w3.org/2000/01/rdf-schema#label': [
            {
                '@value': 'Name'
            }
        ]
    },
    {
        '@id': 'http://fairspace.io/ontology#description',
        '@type': [
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
        ],
        'http://www.w3.org/2000/01/rdf-schema#label': [
            {
                '@value': 'Description'
            }
        ]
    },
    {
        '@id': 'http://fairspace.io/ontology#Collection',
        '@type': [
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class'
        ],
        'http://www.w3.org/2000/01/rdf-schema#label': [
            {
                '@value': 'Collection'
            }
        ]
    }
];

const correct_response = [
    {
        key: 'http://fairspace.io/ontology#description',
        label: 'Description',
        values: [
            {'@value': 'More info'},
            {'@value': 'My first collection'}
        ]
    },
    {
        key: 'http://fairspace.io/ontology#name',
        label: 'Name',
        values: [{'@value': 'Collection 5'}]
    },
    {
        'key': '@type',
        'label': 'Type',
        'values': [{
            '@id': 'http://fairspace.io/ontology#Collection',
            'rdfs:label': 'Collection'
        }]
    }
];

it('combines vocabulary and metadata', () => {
    return combine(vocabulary, metadata1)
        .then(result => expect(result).toEqual(correct_response));
});
