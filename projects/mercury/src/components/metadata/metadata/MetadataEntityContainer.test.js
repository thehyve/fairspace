import React from 'react';
import {mount} from "enzyme";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";

import ConnectedMetadata from "./MetadataEntityContainer";
import Vocabulary from "../../../services/Vocabulary";
import Config from "../../../services/Config/Config";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

describe('MetadataEntityContainer', () => {
    beforeAll(() => {
        window.fetch = jest.fn(() => Promise.resolve({ok: true, json: () => ({})}));

        Config.setConfig({
            urls: {
                metadata: "/metadata"
            }
        });

        return Config.init();
    });

    it('shows a message if no metadata was found', () => {
        const store = mockStore({
            metadataBySubject: {
                "http://fairspace.com/iri/collections/1": {
                    data: []
                }
            },
            metadataForm: {
                "http://fairspace.com/iri/collections/1": {
                    updates: {}
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
            metadataForm: {},
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

});
