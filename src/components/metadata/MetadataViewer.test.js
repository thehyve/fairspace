import MetadataViewer from "./MetadataViewer"
import React from 'react';
import {mount} from "enzyme";

function flushPromises() {
    return new Promise((resolve, reject) => resolve());
}

it('combines vocabulary and metadata', () => {
    const wrapper = mount(<MetadataViewer vocabulary={vocabulary} metadata={metadata1} />);

    return flushPromises().then(() => {
        const result = wrapper.find("li");
        console.log(wrapper);
        console.log(result);
        expect(result.length).toEqual(2);
    });
});

// it('adds non fairspace identifiers, no label', () => {
//     const check = new MetadataViewer({"vocabulary": vocabulary, "metadata": metadata2});
//     check.getIds(check.metadata);
//     check.getLabels();
//     expect(check.contentMap).toEqual({"Collection": "this url", "Description": "What", "dats:name": "John's quotes"});
// });
//
// it('adds multiple nested', () => {
//     const check = new MetadataViewer({"vocabulary": vocabulary, "metadata": metadata3});
//     check.getIds(check.metadata);
//     check.getLabels();
//     expect(check.contentMap).toEqual({"Collection": "this url", "Description": "What", "Name": "test123456789"});
// });

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
    "dats:name" : "John's quotes",
    "fairspace:description" : "What",
    "fairspace:Collection" : "this url",
};

const metadata3 = {
    "test1" : {"test2" : [{"fairspace:name" : "test123456789"}]},
    "fairspace:description" : "What",
    "fairspace:Collection" : "this url",
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
