import MetadataViewer from "./MetadataViewer"
import React from 'react';
import {mount} from "enzyme";

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

it('combines vocabulary and metadata', () => {
    const wrapper = mount(<MetadataViewer vocabulary={vocabulary} metadata={metadata1}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(6);
        expect(wrapper.text()).toEqual("Description:My first collectionName:Collection 5Type:Collection");
    });
});

it('does not show metadata with missing label', () => {
    const wrapper = mount(<MetadataViewer vocabulary={vocabulary} metadata={metadata2}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(6);
        expect(wrapper.text()).not.toContain("what");
    });
});

it('shows non labelled type when there is no vocabulary provided', () => {
    const wrapper = mount(<MetadataViewer vocabulary={empty_vocabulary} metadata={metadata1}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(2);
        expect(wrapper.text()).toContain("Type:http://fairspace.io/ontology#Collection");
    });
});

it('shows nothing when there is no metadata provided', () => {
    const wrapper = mount(<MetadataViewer vocabulary={vocabulary} metadata={empty_metadata}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(0);
        expect(wrapper.text()).toEqual("No metadata found");
    });
});

it('does not show extra labels', () => {
    const wrapper = mount(<MetadataViewer vocabulary={vocabulary2} metadata={metadata2}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(6);
        expect(wrapper.text()).not.toContain("Patient");
    });
});

it('shows types when multiple defined', () => {
    const wrapper = mount(<MetadataViewer vocabulary={full_vocab} metadata={metadata3}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(7);
        expect(wrapper.text())
            .toEqual("Description:An example collection with testdata from GSE8581Name:GSE8581Type:CollectionDataset");
    });
});

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
    "@id": "http://fairspace.com/iri/collections/1",
    "@type": "http://fairspace.io/ontology#Collection",
    "description": "My first collection",
    "name": "Collection 5",
    "what": "test",
    "@context": {
        "name": {
            "@id": "http://fairspace.io/ontology#name"
        },
        "description": {
            "@id": "http://fairspace.io/ontology#description"
        }
    }
};

const metadata3 = {
    "@context": {
        "ws": "http://localhost:3000/iri/",
        "sdo": "http://schema.org/",
        "fs": "http://fairspace.io/ontology#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "name": "fs:name",
        "description": "fs:description",
        "about": "sdo:about",
        "derivesFrom": "fs:derivesFrom",
        "isConsentOf": "fs:isConsentOf",
        "dataset": "sdo:Dataset",
        "person": "sdo:Person",
        "material": "sdo:Material"
    },
    "@graph": [
        {
            "@id": "ws:collections/1",
            "@type": [
                "fs:Collection",
                "sdo:Dataset"
            ],
            "description": "An example collection with testdata from GSE8581",
            "name": "GSE8581"
        }
    ]
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
        },
        {
            "@id": "fairspace:Dataset",
            "@type": "rdf:Class",
            "rdfs:label": "Dataset"
        }
    ]
};

const vocabulary2 = {
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
        },
        {
            "@id": "fairspace:Patient",
            "@type": "rdf:Property",
            "rdfs:label": "Patient"
        }
    ]
};

const full_vocab = {
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
        },
        {
            "@id": "schema:about",
            "@type": "rdf:Property",
            "rdfs:label": "Is about"
        },
        {
            "@id": "schema:Dataset",
            "@type": "rdf:Class",
            "rdfs:label": "Dataset"
        }
    ]
};

const empty_vocabulary = {};
const empty_metadata = {};
