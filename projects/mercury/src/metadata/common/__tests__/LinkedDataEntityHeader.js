import React from 'react';
import {mount} from "enzyme";
import {Provider} from "react-redux";
import configureStore from 'redux-mock-store';

import {LinkedDataEntityHeader} from "../LinkedDataEntityHeader";
import DeleteEntityButton from "../DeleteEntityButton";
import {
    COLLECTION_URI, CREATED_BY_URI, DATE_DELETED_URI, DELETED_BY_URI, DIRECTORY_URI, FILE_URI, FIXED_SHAPE_URI
} from "../../../constants";

const mockStore = configureStore();

const store = mockStore({
    cache: {},
});

describe('LinkedDataEntityHeader', () => {
    const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';

    describe('delete button', () => {
        const testDeleteButtonDeletableState = (values, expectedDeletableState) => {
            const wrapper = mount(
                <Provider store={store}>
                    <LinkedDataEntityHeader
                        subject={subject}
                        values={values}
                    />
                </Provider>
            );

            const button = wrapper.find(DeleteEntityButton);
            expect(button.length).toBe(1);
            expect(button.prop("isDeletable")).toBe(expectedDeletableState);
        };

        it('should show a delete button for regular entities', () => {
            testDeleteButtonDeletableState({
                '@type': [{id: 'http://random-type'}],
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}]
            }, true);
        });

        it('should show a disabled button for fixed shapes', () => {
            testDeleteButtonDeletableState({
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}],
                [FIXED_SHAPE_URI]: [{value: true}]
            }, false);
        });

        it('should show a disabled delete button for deleted entities', () => {
            testDeleteButtonDeletableState({
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}],
                [DELETED_BY_URI]: [{id: 'http://some-person', label: 'John'}],
                [DATE_DELETED_URI]: [{value: '2000-01-01'}]
            }, false);
        });

        it('should show a disabled delete button for collections, files and directories', () => {
            testDeleteButtonDeletableState({'@type': [{id: COLLECTION_URI}]}, false);
            testDeleteButtonDeletableState({'@type': [{id: DIRECTORY_URI}]}, false);
            testDeleteButtonDeletableState({'@type': [{id: FILE_URI}]}, false);
        });
    });
});
