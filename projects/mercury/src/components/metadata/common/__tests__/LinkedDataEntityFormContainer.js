import React from 'react';
import {mount, shallow} from "enzyme";
import configureStore from 'redux-mock-store';
import {Provider} from "react-redux";
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";

import LinkedDataEntityFormContainer from "../LinkedDataEntityFormContainer";
import {LinkedDataEntityForm} from "../LinkedDataEntityForm";
import {STRING_URI} from "../../../../constants";
import StringValue from "../values/StringValue";

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
            isEditable: true
        }, {
            key: 'http://www.w3.org/2000/01/rdf-schema#label',
            label: "Label",
            values: [],
            datatype: STRING_URI,
            maxValuesCount: 1,
            machineOnly: false,
            multiLine: false,
            isEditable: true
        }];

        const updates = {
            'http://www.w3.org/2000/01/rdf-schema#comment': [
                {value: 'My collection'}
            ],
            'http://www.w3.org/2000/01/rdf-schema#label': [
                {value: 'Some label'}
            ]
        };

        const fetchShapes = jest.fn();
        const fetchMetadata = jest.fn();
        const wrapper = shallow(<LinkedDataEntityFormContainer
            formKey="http://example.com/john"
            subject="http://example.com/john"
            updates={updates}
            properties={properties}
            fetchShapes={fetchShapes}
            fetchLinkedData={fetchMetadata}
        />);

        const formProperties = wrapper.find(LinkedDataEntityForm).prop('properties');

        expect(formProperties[0].values).toEqual([{value: "My collection"}]);
        expect(formProperties[1].values).toEqual([{value: "Some label"}]);
    });

    it('tries to initialize the shapes and the content', () => {
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

        const fetchShapes = jest.fn();
        const fetchContent = jest.fn();
        mount(
            <Provider store={store}>
                <LinkedDataEntityFormContainer
                    subject="http://example.com/john"
                    formKey="http://example.com/john"
                    fetchShapes={fetchShapes}
                    fetchLinkedData={fetchContent}
                    valueComponentFactory={mockComponentFactory}
                />
            </Provider>
        );

        expect(fetchContent.mock.calls.length).toEqual(1);
        expect(fetchShapes.mock.calls.length).toEqual(1);
    });
});
