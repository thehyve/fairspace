import React from 'react';
import {mount} from "enzyme";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import Vocabulary from "../../../services/Vocabulary";
import LinkedDataEntityFormContainer from "./LinkedDataEntityFormContainer";
import {LinkedDataEntityForm} from "./LinkedDataEntityForm";
import {STRING_URI} from "../../../constants";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

describe('LinkedDataEntityFormContainer', () => {
    it('combines the original metadata with the updates', () => {
        const properties = [{
            key: "http://www.w3.org/2000/01/rdf-schema#comment",
            label: "",
            values: [
                {value: "My first collection"},
                {value: "My second collection"}
            ],
            datatype: STRING_URI,
            allowMultiple: false,
            machineOnly: false,
            multiLine: false
        }, {
            key: 'http://www.w3.org/2000/01/rdf-schema#label',
            label: "Label",
            values: [],
            datatype: STRING_URI,
            allowMultiple: false,
            machineOnly: false,
            multiLine: false
        }];

        const store = mockStore({
            cache: {
                jsonLdBySubject: {},
                vocabulary: {}
            },
            metadataForm: {
                "http://example.com/john": {
                    updates: {
                        'http://www.w3.org/2000/01/rdf-schema#comment': [
                            {value: 'My collection'}
                        ],
                        'http://www.w3.org/2000/01/rdf-schema#label': [
                            {value: 'Some label'}
                        ]
                    }
                }
            }
        });

        const fetchVocabulary = jest.fn();
        const fetchMetadata = jest.fn();
        const wrapper = mount(<LinkedDataEntityFormContainer
            formKey="http://example.com/john"
            subject="http://example.com/john"
            store={store}
            properties={properties}
            fetchShapes={fetchVocabulary}
            fetchLinkedData={fetchMetadata}
        />);

        const formProperties = wrapper.find(LinkedDataEntityForm).prop('properties');

        expect(formProperties[0].values).toEqual([{value: "My collection"}]);
        expect(formProperties[1].values).toEqual([{value: "Some label"}]);
    });

    it('tries to initialize the metadata and the vocabulary', () => {
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
            },
            metadataForm: {}
        });

        const fetchVocabulary = jest.fn();
        const fetchMetadata = jest.fn();
        mount(<LinkedDataEntityFormContainer
            subject="http://example.com/john"
            formKey="http://example.com/john"
            store={store}
            fetchShapes={fetchVocabulary}
            fetchLinkedData={fetchMetadata}
        />);

        expect(fetchMetadata.mock.calls.length).toEqual(1);
        expect(fetchVocabulary.mock.calls.length).toEqual(1);
    });


});
