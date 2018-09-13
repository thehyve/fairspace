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

const metadata = [
    {
        "@id": "http://fairspace.com/iri/collections/1",
        "@type": [
            "http://fairspace.io/ontology#Collection"
        ],
        "http://fairspace.io/ontology#description": [
            {
                "@value": "My first collection"
            }
        ],
        "http://fairspace.io/ontology#name": [
            {
                "@value": "Collection 5"
            }
        ]
    }
];

const vocabulary = [
    {
        "@id": "http://fairspace.io/ontology#name",
        "@type": [
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
        ],
        "http://www.w3.org/2000/01/rdf-schema#label": [
            {
                "@value": "Name"
            }
        ]
    },
    {
        "@id": "http://fairspace.io/ontology#description",
        "@type": [
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
        ],
        "http://www.w3.org/2000/01/rdf-schema#label": [
            {
                "@value": "Description"
            }
        ]
    },
    {
        "@id": "http://fairspace.io/ontology#Collection",
        "@type": [
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#Class"
        ],
        "http://www.w3.org/2000/01/rdf-schema#label": [
            {
                "@value": "Collection"
            }
        ]
    }
];
