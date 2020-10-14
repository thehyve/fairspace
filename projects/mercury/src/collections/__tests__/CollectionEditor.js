import React from "react";
import {shallow} from "enzyme";

import {CollectionEditor, isInputValid} from '../CollectionEditor';
import type {CollectionProperties} from '../CollectionAPI';

let collectionEditor;
let wrapper;
let saveCallback;
let closeCallback;

beforeEach(() => {
    saveCallback = jest.fn(() => Promise.resolve());
    closeCallback = jest.fn();
});

const collection: CollectionProperties = {
    name: 'Collection',
    description: 'description',
    ownerWorkspace: "http://owner"
};

const longName = 'aaaaabbbbbcccccdddddeeeeefffffggggghhhhhiiiiijjjjjkkkkklllllmmmmmnnnnnooooopppppqqqqqrrrrrrssssstttttuuuuuuvvvvvvwwwwwwxxxxxyyyyyzzzzz';

describe('CollectionEditor', () => {
    describe('isInputValid', () => {
        it('marks input as valid if name is properly filled', () => {
            expect(isInputValid(collection)).toBe(true);
        });

        it('marks input as invalid if name is empty', () => {
            expect(isInputValid({name: ''})).toBe(false);
        });

        it('marks input as invalid if name is too long', () => {
            expect(isInputValid({name: longName})).toBe(false);
        });
    });

    describe('saving', () => {
        const name = 'New collection';
        const description = 'new-description';
        const ownerWorkspace = 'http://owner';

        beforeEach(() => {
            collectionEditor = (
                <CollectionEditor
                    editing
                    title="title"
                    addCollection={saveCallback}
                    collection={collection}
                    onClose={closeCallback}
                    onSave={saveCallback}
                    editType
                />
            );
            wrapper = shallow(collectionEditor);
        });

        it('invokes the save callback with existing parameters if nothing is entered', () => {
            jest.useFakeTimers();
            wrapper.instance().handleSave();
            jest.runAllTimers();

            expect(saveCallback).toHaveBeenCalledTimes(1);
            expect(saveCallback).toHaveBeenCalledWith(collection);
        });

        it('invokes the save callback with parameters entered by the user', () => {
            wrapper.instance().handleInputChange('name', name);
            wrapper.instance().handleInputChange('description', description);

            jest.useFakeTimers();
            wrapper.instance().handleSave();
            jest.runAllTimers();

            expect(saveCallback).toHaveBeenCalledTimes(1);
            expect(saveCallback).toHaveBeenCalledWith({name, description, ownerWorkspace});
        });

        it('does not invoke the save callback when no name is present', () => {
            wrapper.instance().handleInputChange('name', '');
            wrapper.instance().handleInputChange('description', description);

            expect(wrapper.find('[aria-label="Save"]').prop('disabled')).toBe(true);
        });
    });
});
