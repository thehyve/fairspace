import React from 'react';
import {mount, shallow} from "enzyme";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import {List} from '@material-ui/core';

import ConnectedMetadata, {MetadataEntityContainer} from "./MetadataEntityContainer";
import Vocabulary from "../../services/Vocabulary";
import Config from "../../services/Config/Config";

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

it('render properties', () => {
    const metadata = [
        {
            key: "http://fairspace.io/ontology#createdBy",
            label: "Creator",
            values: [
                {
                    id: "http://fairspace.io/iri/6ae1ef15-ae67-4157-8fe2-79112f5a46fd",
                    label: "John"
                }
            ],
            range: "http://fairspace.io/ontology#User",
            allowMultiple: false,
            machineOnly: true,
            multiLine: false
        }
    ];
    const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';
    const wrapper = shallow(<MetadataEntityContainer
        properties={metadata}
        subject={subject}
    />);
    expect(wrapper.find(List).children().length).toBe(1);
});

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
                data: new Vocabulary([])
            }
        }
    });

    const wrapper = mount(<ConnectedMetadata subject="http://fairspace.com/iri/collections/1" store={store} />);

    expect(wrapper.text()).toContain("An error occurred");
});

it('shows error when no subject provided', () => {
    const store = mockStore({
        metadataBySubject: {},
        cache: {
            vocabulary:
            {
                data: new Vocabulary([])
            }
        }
    });
    const wrapper = mount(<ConnectedMetadata subject={null} store={store} />);

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
                data: new Vocabulary([])
            }
        }
    });

    const fetchCombinedMetadataIfNeeded = jest.fn();
    mount(<MetadataEntityContainer subject="John" properties={[]} store={store} fetchCombinedMetadataIfNeeded={fetchCombinedMetadataIfNeeded} />);
    expect(fetchCombinedMetadataIfNeeded.mock.calls.length).toEqual(1);
});
