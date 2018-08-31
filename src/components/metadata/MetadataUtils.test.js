import combine from './MetadataUtils';

const metadata1 = {
    "@id": "http://fairspace.com/iri/collections/1",
    "@type": "http://fairspace.io/ontology#Collection",
    "description": ["My first collection", "More info"],
    "name": "Collection 5",
    "@context": {
        "name": {
            "@id": "http://fairspace.io/ontology#name"
        },
        "description": {
            "@id": "http://fairspace.io/ontology#description"
        }
    }
};

const vocabulary = {
    "@context": {
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "dc": "http://purl.org/dc/elements/1.1/",
        "schema": "http://schema.org/",
        "fairspace": "http://fairspace.io/ontology#"
    },
    "@graph": [
        {
            "@id": "fairspace:name",
            "@type": "rdf:Property",
            "rdfs:label": "Name"
        },
        {
            "@id": "fairspace:description",
            "@type": "rdf:Property",
            "rdfs:label": "Description"
        },
        {
            "@id": "fairspace:Collection",
            "@type": "rdf:Class",
            "rdfs:label": "Collection"
        }
    ]
};

const correct_response = [
    {label: 'Description', values: [{'@value': 'More info'}, {'@value': 'My first collection'}]},
    {label: 'Name', values: [{'@value': 'Collection 5'}]}, {"label": "Type", "values":
            [{"@id": "http://fairspace.io/ontology#Collection", "rdfs:label": "Collection"}]}
    ];

it('combines vocabulary and metadata', () => {
    combine(vocabulary, metadata1)
        .then(result => expect(result).toEqual(correct_response));
});
