import ConnectedMetadata from "./Metadata"
import { Metadata } from "./Metadata"
import React from 'react';
import {mount} from "enzyme";
import Vocabulary from "../../services/MetadataAPI/Vocabulary";
import mockStore from "../../store/mockStore"
import MetadataViewer from "./MetadataViewer";
import {Provider} from "react-redux";

it('shows result when subject provided and data is loaded', () => {
    const store = mockStore({
        metadataBySubject: {
            "http://fairspace.com/iri/collections/1": {
                items: [
                    {key: 'test', values: []}
                ]
            }
        },
        cache: {
            vocabulary:
                {
                    item: new Vocabulary(vocabulary)
                }
        }
    });

    const wrapper = mount(<Provider store={store}><ConnectedMetadata subject={"http://fairspace.com/iri/collections/1"} /></Provider>);

    expect(wrapper.find(MetadataViewer).length).toEqual(1);
});

it('shows a message if no metadata was found', () => {
    const store = mockStore({
        metadataBySubject: {
            "http://fairspace.com/iri/collections/1": {
                items: []
            }
        },
        cache: {
            vocabulary:
                {
                    item: new Vocabulary(vocabulary)
                }
        }
    });


    const wrapper = mount(<ConnectedMetadata subject={"http://fairspace.com/iri/collections/1"} store={store} />);

    expect(wrapper.text()).toEqual("Metadata:No metadata found");
});

it('shows error when no subject provided', () => {
    const store = mockStore({
        metadataBySubject: {},
        cache: {
            vocabulary:
                {
                    item: new Vocabulary(vocabulary)
                }
        }
    });
    const wrapper = mount(<ConnectedMetadata subject={""} store={store} />);

    expect(wrapper.text()).toEqual("Metadata:error_outlineAn error occurred while loading metadata");
});

it('tries to load the metadata and the vocabulary', () => {
    const store = mockStore({ cache: {
            jsonLdBySubject: {
                "http://fairspace.com/iri/collections/1": {
                    items: []
                }
            },
            vocabulary: {
                item: new Vocabulary(vocabulary)
            }
        }});

    const dispatch = jest.fn();
    const wrapper = mount(<Metadata subject={"John"} store={store} dispatch={dispatch}/>);

    expect(dispatch.mock.calls.length).toEqual(1);
});

const vocabulary = [
    {
        "@id": "@type",
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
        'http://www.w3.org/2000/01/rdf-schema#label': [{ '@value': 'Type' }],
        "http://www.w3.org/2000/01/rdf-schema#domain": [
            {"@id": "http://fairspace.io/ontology#Collection"}
        ]
    },
    {
        '@id': 'http://fairspace.io/ontology#name',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
        'http://www.w3.org/2000/01/rdf-schema#label': [{ '@value': 'Name' }],
        'http://www.w3.org/2000/01/rdf-schema#domain': [{ '@id': 'http://fairspace.io/ontology#Collection' }]
    },
    {
        '@id': 'http://fairspace.io/ontology#description',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
        'http://www.w3.org/2000/01/rdf-schema#label': [{ '@value': 'Description' }],
        'http://www.w3.org/2000/01/rdf-schema#domain': [{ '@id': 'http://fairspace.io/ontology#Collection' }]
    },
    {
        '@id': 'http://schema.org/Creator',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
        'http://www.w3.org/2000/01/rdf-schema#label': [{ '@value': 'Creator' }],
        'http://www.w3.org/2000/01/rdf-schema#domain': []
    },
    {
        '@id': 'http://schema.org/CreatedDate',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
        'http://www.w3.org/2000/01/rdf-schema#label': [{ '@value': 'Created date' }],
        'http://www.w3.org/2000/01/rdf-schema#domain': [{ '@id': 'http://fairspace.io/ontology#Collection' }]
    },
    {
        '@id': 'http://fairspace.io/ontology#Collection',
        '@type': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class',
        'http://www.w3.org/2000/01/rdf-schema#label': [{ '@value': 'Collection' }]
    }
];
