import React from 'react';
import {mount, shallow} from "enzyme";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import {Button, List, Grid} from '@material-ui/core';

import LinkedDataEntityForm from "./LinkedDataEntityForm";
import Vocabulary from "../../../services/Vocabulary";
import Config from "../../../services/Config/Config";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

describe('MetaEntityForm', () => {
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
        const wrapper = shallow(<LinkedDataEntityForm
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

        const wrapper = shallow(<LinkedDataEntityForm
            properties={metadata}
            editable
            subject={collection.iri}
        />);

        expect(wrapper.find(List).length).toEqual(1);
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

        const fetchVocabulary = jest.fn();
        const fetchMetadata = jest.fn();
        mount(<LinkedDataEntityForm
            subject="http://example.com/john"
            properties={[]}
            store={store}
            fetchShapes={fetchVocabulary}
            fetchLinkedData={fetchMetadata}
        />);

        expect(fetchMetadata.mock.calls.length).toEqual(1);
        expect(fetchVocabulary.mock.calls.length).toEqual(1);
    });

    it('updates state properly', () => {
        const wrapper = shallow(<LinkedDataEntityForm subject="http://example.com/john" properties={[]} />);
        wrapper.instance().updateState('key', 'value');
        expect(wrapper.state('propertiesWithUpdatedValues')).toEqual({key: 'value'});
    });

    it('handleChange as update and proper state update', () => {
        const wrapper = shallow(<LinkedDataEntityForm subject="http://example.com/john" properties={[]} />);
        const property = {
            key: "propert-key",
            values: [{
                someProp: 'value'
            }],
        };
        const updatedValue = {
            someProp: 'other value'
        };

        wrapper.instance().handleChange(property, updatedValue, 0);

        const expected = {
            'propert-key': [{someProp: "other value"}]
        };

        expect(wrapper.state('propertiesWithUpdatedValues')).toEqual(expected);
    });


    it('handleChange as add new and proper state update', () => {
        const wrapper = shallow(<LinkedDataEntityForm subject="http://example.com/john" properties={[]} />);
        const property = {
            key: "propert-key",
            values: [],
        };
        const updatedValue = {
            someProp: 'other value'
        };

        wrapper.instance().handleAdd(property, updatedValue, undefined);

        const expected = {
            'propert-key': [{someProp: "other value"}]
        };

        expect(wrapper.state('propertiesWithUpdatedValues')).toEqual(expected);
    });

    it('gives the correct state of pending changes', () => {
        const wrapper = shallow(<LinkedDataEntityForm subject="http://example.com/john" properties={[]} />);
        expect(wrapper.instance().anyPendingChanges()).toBe(false);
        const state = {propertiesWithUpdatedValues: {key: 'value'}};
        wrapper.setState(state);
        expect(wrapper.instance().anyPendingChanges()).toBe(true);
    });


    it('makes call to updateEntity and reset changes after submission', (done) => {
        const updateEntity = jest.fn(() => Promise.resolve());
        const vocabulary = new Vocabulary();
        const wrapper = shallow(<LinkedDataEntityForm subject="http://example.com/john" properties={[]} updateEntity={updateEntity} vocabulary={vocabulary} />);
        const state = {propertiesWithUpdatedValues: {key: 'value'}};
        wrapper.setState(state);
        wrapper.find(Button).simulate('click');
        expect(updateEntity.mock.calls.length).toEqual(1);
        expect(updateEntity.mock.calls[0]).toEqual(['http://example.com/john', {...state.propertiesWithUpdatedValues}, vocabulary]);
        setTimeout(() => {
            expect(wrapper.state('propertiesWithUpdatedValues')).toEqual({});
            done();
        });
    });
});
