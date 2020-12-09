/* eslint-disable jest/expect-expect */
import React from 'react';
import {mount} from "enzyme";

import LinkedDataEntityHeader from "../LinkedDataEntityHeader";
import DeleteEntityButton from "../DeleteEntityButton";
import {
    COLLECTION_URI,
    CREATED_BY_URI,
    DATE_DELETED_URI,
    DELETED_BY_URI,
    DIRECTORY_URI,
    FILE_URI,
} from "../../../constants";
import VocabularyContext from '../../vocabulary/VocabularyContext';

describe('LinkedDataEntityHeader', () => {
    const subject = 'https://workspace.ci.test.fairdev.app/iri/collections/500';

    type DeleteButtonState = 'Enabled' | 'Disabled' | 'NotPresent';

    describe('delete button', () => {
        const testDeleteButtonDeletableState = (values, expectedState: DeleteButtonState, editingEnabled = true) => {
            const wrapper = mount(
                <VocabularyContext.Provider
                    value={{
                        vocabulary: []
                    }}
                >
                    <LinkedDataEntityHeader
                        subject={subject}
                        enableDelete={editingEnabled}
                        values={values}
                        isDeleted={values[DATE_DELETED_URI]}
                    />
                </VocabularyContext.Provider>
            );

            const button = wrapper.find(DeleteEntityButton);
            if (expectedState === 'NotPresent') {
                expect(button.length).toBe(0);
            } else {
                expect(button.length).toBe(1);
                expect(button.prop("isDeletable")).toBe(expectedState === 'Enabled');
            }
        };

        it('should show a delete button for regular entities', () => {
            testDeleteButtonDeletableState({
                '@type': [{id: 'http://random-type'}],
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}]
            }, 'Enabled');
        });

        it('should show a disabled delete button for deleted entities', () => {
            testDeleteButtonDeletableState({
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}],
                [DELETED_BY_URI]: [{id: 'http://some-person', label: 'John'}],
                [DATE_DELETED_URI]: [{value: '2000-01-01'}]
            }, 'Disabled');
        });

        it('should show a disabled delete button for collections, files and directories', () => {
            testDeleteButtonDeletableState({'@type': [{id: COLLECTION_URI}]}, 'Disabled');
            testDeleteButtonDeletableState({'@type': [{id: DIRECTORY_URI}]}, 'Disabled');
            testDeleteButtonDeletableState({'@type': [{id: FILE_URI}]}, 'Disabled');
        });

        it('should not show a delete button when editing is disabled', () => {
            testDeleteButtonDeletableState({
                '@type': [{id: 'http://random-type'}],
                [CREATED_BY_URI]: [{id: "http://some-person", label: "John"}]
            }, 'NotPresent', false);
        });
    });
});
