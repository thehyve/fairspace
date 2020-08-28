import React from "react";
import {shallow} from "enzyme";

import {CollectionEditor, convertToSafeDirectoryName, isInputValid} from '../CollectionEditor';
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
    location: 'location',
    ownerWorkspace: "http://owner"
};

const longName = 'aaaaabbbbbcccccdddddeeeeefffffggggghhhhhiiiiijjjjjkkkkklllllmmmmmnnnnnooooopppppqqqqqrrrrrrssssstttttuuuuuuvvvvvvwwwwwwxxxxxyyyyyzzzzz';

describe('location generation from name', () => {
    it('keeps name with only characters', () => expect(convertToSafeDirectoryName('MyCollection')).toEqual('MyCollection'));
    it('replaces spaces', () => expect(convertToSafeDirectoryName('My Collection')).toEqual('My_Collection'));
    it('replaces multiple spaces with a single underscore', () => expect(convertToSafeDirectoryName('My  Collection')).toEqual('My_Collection'));
    it('allows characters, numbers, underscores and dashes', () => expect(convertToSafeDirectoryName('My-special_Collection-01234')).toEqual('My-special_Collection-01234'));
    it('strips other characters', () => expect(convertToSafeDirectoryName('a!@#$%^&*?()~,.<>;\':"[]{}a')).toEqual('a_a'));
    it('strips unicode characters', () => expect(convertToSafeDirectoryName('•∞₩ⓘˍ')).toEqual('_'));

    it('truncates at 127 characters', () => expect(convertToSafeDirectoryName('a'.repeat(128)).length).toEqual(127));
    it('uses the first 127 characters', () => expect(convertToSafeDirectoryName(longName)).toEqual(longName.substring(0, 127)));
});

describe('CollectionEditor', () => {
    describe('automatic location entry', () => {
        beforeEach(() => {
            collectionEditor = (
                <CollectionEditor
                    editing
                    title="title"
                    onClose={closeCallback}
                    onSave={saveCallback}
                    editType
                />
            );

            wrapper = shallow(collectionEditor);
        });

        it('fills the location based on the name', () => {
            // Enter a new name
            wrapper.instance().handleNameChange({target: {value: 'MyCollection'}});

            // Make sure the location is changed along
            expect(wrapper.instance().state.properties.location).toEqual('MyCollection');
        });

        it('fills the location with only safe character', () => {
            // Enter a new name
            wrapper.instance().handleNameChange({target: {value: 'John Snow\'s collection'}});

            // Make sure the location is changed along
            expect(wrapper.instance().state.properties.location).toEqual('John_Snow_s_collection');
        });

        it('updates the location based on the name if the location was not changed by the user', () => {
            // Enter a name
            wrapper.instance().handleNameChange({target: {value: 'John Snow\'s collection'}});
            expect(wrapper.instance().state.properties.location).toEqual('John_Snow_s_collection');

            // Enter a new name
            wrapper.instance().handleNameChange({target: {value: 'Someone elses collection'}});
            expect(wrapper.instance().state.properties.location).toEqual('Someone_elses_collection');
        });

        it('does not update the location based on the name if the location was changed by the user', () => {
            // Enter a name and change the location
            wrapper.instance().handleNameChange({target: {value: 'John Snow\'s collection'}});
            wrapper.instance().handleInputChange('location', 'my-custom-location');

            // Enter a new name
            wrapper.instance().handleNameChange({target: {value: 'Someone elses collection'}});
            expect(wrapper.instance().state.properties.location).toEqual('my-custom-location');
        });
    });

    describe('isInputValid', () => {
        it('marks input as valid if name and location are properly filled', () => {
            expect(isInputValid(collection)).toBe(true);
        });

        it('marks input as invalid if name is empty', () => {
            expect(isInputValid({name: ''})).toBe(false);
        });

        it('marks input as invalid if location is empty', () => {
            expect(isInputValid({location: ''})).toBe(false);
        });

        it('marks input as invalid if location contains invalid characters', () => {
            const invalidCharacters = ['.', '#', '!', '$', '(', ')', '~', ';', '會'];
            invalidCharacters.forEach(c => {
                expect(isInputValid({location: c})).toBe(false);
            });
        });
    });

    describe('saving', () => {
        const name = 'New collection';
        const description = 'new-description';
        const location = 'new-location';
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
            jest.useFakeTimers();

            wrapper.instance().handleInputChange('name', name);
            wrapper.instance().handleInputChange('description', description);
            wrapper.instance().handleInputChange('location', location);

            wrapper.instance().handleSave();

            jest.runAllTimers();

            expect(saveCallback).toHaveBeenCalledTimes(1);
            expect(saveCallback).toHaveBeenCalledWith({name, description, location, ownerWorkspace});
        });

        it('does not invoke the save callback when no name is present', () => {
            wrapper.instance().handleInputChange('name', '');
            wrapper.instance().handleInputChange('description', description);
            wrapper.instance().handleInputChange('location', location);

            expect(wrapper.find('[aria-label="Save"]').prop('disabled')).toBe(true);
        });

        it('does not invoke the save callback when no location is present', () => {
            wrapper.instance().handleInputChange('name', name);
            wrapper.instance().handleInputChange('description', description);
            wrapper.instance().handleInputChange('location', '');

            expect(wrapper.find('[aria-label="Save"]').prop('disabled')).toBe(true);
        });
    });
});
