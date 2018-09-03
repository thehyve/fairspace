import Metadata from "./Metadata"
import React from 'react';
import {mount} from "enzyme";

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

let mockMetadataStore;

let mockNoMetadataStore;

beforeEach(() => {
    mockMetadataStore = {
        getVocabulary: jest.fn(() => Promise.resolve(vocabulary)),
        get: jest.fn(() => Promise.resolve(metadata))
    };

    mockNoMetadataStore = {
        getVocabulary: jest.fn(() => Promise.resolve(vocabulary)),
        get: jest.fn(() => Promise.resolve([]))
    }
});

it('shows result when subject provided', () => {
    const wrapper = mount(<Metadata subject={"http://fairspace.com/iri/collections/1"} metadataStore={mockMetadataStore} />);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(6);
    });
});

it('shows error when no subject provided', () => {
    const wrapper = mount(<Metadata subject={""} metadataStore={mockNoMetadataStore} />);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(0);
        expect(wrapper.text()).toEqual("Metadata:error_outlineAn error occurred while loading metadata");
    });
});

it('shows nothing when there is no metadata found', () => {
    const wrapper = mount(<Metadata subject={"test"} metadataStore={mockNoMetadataStore}/>);
    return flushPromises().then(() => {
        wrapper.update();
    }).then(() => {
        const result = wrapper.find("li");
        expect(result.length).toEqual(0);
        expect(wrapper.text()).toEqual("Metadata:No metadata found");
    });
});

const metadata = {
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
