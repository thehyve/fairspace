import MetadataViewer from "./MetadataViewer"

it('combines vocabulary and metadata', () => {
    const check = new MetadataViewer({"vocab": vocab, "metadata": metadata1});
    check.getIds(check.metadata);
    check.getLabels();
    expect(check.contentMap).toEqual({
            "Collection": "this url",
            "Description": "What",
            "Name": ["John's quotes", ", ", "testerdetest", ", ", "test123456789"]
    });
});

it('adds non fairspace identifiers, no label', () => {
    const check = new MetadataViewer({"vocab": vocab, "metadata": metadata2});
    check.getIds(check.metadata);
    check.getLabels();
    expect(check.contentMap).toEqual({"Collection": "this url", "Description": "What", "dats:name": "John's quotes"});
});

it('adds multiple nested', () => {
    const check = new MetadataViewer({"vocab": vocab, "metadata": metadata3});
    check.getIds(check.metadata);
    check.getLabels();
    expect(check.contentMap).toEqual({"Collection": "this url", "Description": "What", "Name": "test123456789"});
});

const metadata1 = {
    "fairspace:name" : "John's quotes",
    "fairspace:description" : "What",
    "test" : [{"fairspace:name" : "testerdetest"}],
    "fairspace:Collection" : "this url",
    "test2" : {"fairspace:name" : "test123456789"}
};

const metadata2 = {
    "dats:name" : "John's quotes",
    "fairspace:description" : "What",
    "fairspace:Collection" : "this url",
};

const metadata3 = {
    "test1" : {"test2" : [{"fairspace:name" : "test123456789"}]},
    "fairspace:description" : "What",
    "fairspace:Collection" : "this url",
};

const vocab = {
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
