import combine from './MetadataUtils';

const metadata1 = {
    "@id": "http://fairspace.com/iri/collections/1",
    "@type": "http://fairspace.io/ontology#Collection",
    "description": "My first collection",
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

const metadata2 = {
    "dats:name": "John's quotes",
    "fairspace:description": "What",
    "fairspace:Collection": "this url",
};

const metadata3 = {
    "test1": {"test2": [{"fairspace:name": "test123456789"}]},
    "fairspace:description": "What",
    "fairspace:Collection": "this url",
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

const correct_response = [{label: 'Description', values: ['My first collection']},
    {label: 'Name', values: ['Collection 5']}]

it('combines vocabulary and metadata', () => {
    combine(vocabulary, metadata1)
        .then(result => {
            expect(result.length).toEqual(2);
            expect(result).toEqual(correct_response);
        });

});
