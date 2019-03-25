import React from 'react';
import {mount, shallow} from "enzyme";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import {List} from '@material-ui/core';

import ConnectedMetadata, {MetadataEntityContainer} from "./MetadataEntityContainer";
import Vocabulary from "../../services/Vocabulary";
import Config from "../../services/Config/Config";
import {PROPERTY_URI, LABEL_URI, DOMAIN_URI, CLASS_URI} from '../../constants';

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

beforeAll(() => {
    window.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => ({})}));

    Config.setConfig({
        urls: {
            metadata: "/metadata"
        }
    });

    return Config.init();
});

const vocabulary = [
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
        '@type': PROPERTY_URI,
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
        '@id': 'http://schema.org/Creator',
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Creator'}],
        [DOMAIN_URI]: []
    },
    {
        '@id': 'http://schema.org/CreatedDate',
        '@type': PROPERTY_URI,
        [LABEL_URI]: [{'@value': 'Created date'}],
        [DOMAIN_URI]: [{'@id': 'http://fairspace.io/ontology#Collection'}]
    },
    {
        '@id': 'http://fairspace.io/ontology#Collection',
        '@type': CLASS_URI,
        [LABEL_URI]: [{'@value': 'Collection'}]
    }
];

it('shows result when subject provided and data is loaded', () => {
    const metadata = [{
        key: "@type",
        label: "",
        values: [
            {
                id: "http://fairspace.io/ontology#BiologicalSample",
                label: "Biological Sample"
            }
        ],
        allowMultiple: false,
        machineOnly: false,
        multiLine: false
    }];

    const collection = {
        iri: "http://fairspace.com/iri/collections/1"
    };

    const wrapper = shallow(<MetadataEntityContainer
        properties={metadata}
        editable
        subject={collection.iri}
        dispatch={() => {}}
    />);

    expect(wrapper.find(List).length).toEqual(1);
});

it('shows a message if no metadata was found', () => {
    const store = mockStore({
        metadataBySubject: {
            "http://fairspace.com/iri/collections/1": {
                data: []
            }
        },
        cache: {
            vocabulary:
            {
                data: new Vocabulary(vocabulary)
            }
        }
    });

    const wrapper = mount(<ConnectedMetadata subject="http://fairspace.com/iri/collections/1" store={store} />);

    expect(wrapper.text()).toContain("An error occurred");
});

it('tries to load the metadata and the vocabulary', () => {
    const store = mockStore({
        cache: {
            jsonLdBySubject: {
                "http://fairspace.com/iri/collections/1": {
                    data: []
                }
            },
            vocabulary: {
                data: new Vocabulary(vocabulary)
            }
        }
    });

    const dispatch = jest.fn();
    mount(<MetadataEntityContainer subject="John" properties={[]} store={store} dispatch={dispatch} />);
    expect(dispatch.mock.calls.length).toEqual(1);
});
