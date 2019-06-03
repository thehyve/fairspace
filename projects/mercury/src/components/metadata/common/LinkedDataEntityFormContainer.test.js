import React from 'react';
import {mount, shallow} from "enzyme";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import {LinkedDataEntityFormContainer} from "./LinkedDataEntityFormContainer";
import {LinkedDataEntityForm} from "./LinkedDataEntityForm";
import {STRING_URI} from "../../../constants";
import StringValue from "./values/StringValue";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

describe('LinkedDataEntityFormContainer', () => {
    const mockComponentFactory = {
        addComponent: () => StringValue,
        editComponent: () => StringValue
    };

    it('combines the original metadata with the updates', () => {
        const properties = [{
            key: "http://www.w3.org/2000/01/rdf-schema#comment",
            label: "",
            values: [
                {value: "My first collection"},
                {value: "My second collection"}
            ],
            datatype: STRING_URI,
            maxValuesCount: 1,
            machineOnly: false,
            multiLine: false,
            editable: true
        }, {
            key: 'http://www.w3.org/2000/01/rdf-schema#label',
            label: "Label",
            values: [],
            datatype: STRING_URI,
            maxValuesCount: 1,
            machineOnly: false,
            multiLine: false,
            editable: true
        }];

        const updates = {
            'http://www.w3.org/2000/01/rdf-schema#comment': [
                {value: 'My collection'}
            ],
            'http://www.w3.org/2000/01/rdf-schema#label': [
                {value: 'Some label'}
            ]
        };

        const fetchVocabulary = jest.fn();
        const fetchMetadata = jest.fn();
        const wrapper = shallow(<LinkedDataEntityFormContainer
            formKey="http://example.com/john"
            subject="http://example.com/john"
            updates={updates}
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
                    data: []
                }
            },
            linkedDataForm: {}
        });

        const fetchVocabulary = jest.fn();
        const fetchMetadata = jest.fn();
        mount(<LinkedDataEntityFormContainer
            subject="http://example.com/john"
            formKey="http://example.com/john"
            store={store}
            fetchShapes={fetchVocabulary}
            fetchLinkedData={fetchMetadata}
            valueComponentFactory={mockComponentFactory}
        />);

        expect(fetchMetadata.mock.calls.length).toEqual(1);
        expect(fetchVocabulary.mock.calls.length).toEqual(1);
    });
});
