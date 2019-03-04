import ReactDOM from "react-dom";
import React from "react";
import {shallow} from "enzyme";
import CollectionEditor from "./CollectionEditor";

let collectionEditor;
let saveCallback;
let closeCallback;

beforeEach(() => {
    saveCallback = jest.fn();
    closeCallback = jest.fn();
});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(collectionEditor, div);
    ReactDOM.unmountComponentAtNode(div);
});

describe('automatic location entry', () => {
    let wrapper;

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

    describe('location generation from name', () => {
        it('keeps name with only characters', () => expect(wrapper.instance().nameToLocation('MyCollection')).toEqual('MyCollection'));
        it('replaces spaces', () => expect(wrapper.instance().nameToLocation('My Collection')).toEqual('My_Collection'));
        it('replaces multiple spaces with a single underscore', () => expect(wrapper.instance().nameToLocation('My  Collection')).toEqual('My_Collection'));
        it('allows characters, numbers, underscores and dashes', () => expect(wrapper.instance().nameToLocation('My-special_Collection-01234')).toEqual('My-special_Collection-01234'));
        it('strips other characters', () => expect(wrapper.instance().nameToLocation('a!@#$%^&*?()~,.<>;\':"[]{}a')).toEqual('a_a'));
        it('strips unicode characters', () => expect(wrapper.instance().nameToLocation('•∞₩ⓘˍ')).toEqual('_'));
    });

    it('fills the location based on the name', () => {
        // Enter a new name
        wrapper.instance().handleNameChange({target: {value: 'MyCollection'}});

        // Make sure the location is changed along
        expect(wrapper.instance().state.location).toEqual('MyCollection');
    });

    it('fills the location with only safe character', () => {
        // Enter a new name
        wrapper.instance().handleNameChange({target: {value: 'John Snow\'s collection'}});

        // Make sure the location is changed along
        expect(wrapper.instance().state.location).toEqual('John_Snow_s_collection');
    });
    it('updates the location based on the name if the location was not changed by the user', () => {
        // Enter a name
        wrapper.instance().handleNameChange({target: {value: 'John Snow\'s collection'}});
        expect(wrapper.instance().state.location).toEqual('John_Snow_s_collection');

        // Enter a new name
        wrapper.instance().handleNameChange({target: {value: 'Someone elses collection'}});
        expect(wrapper.instance().state.location).toEqual('Someone_elses_collection');
    });
    it('does not update the location based on the name if the location was changed by the user', () => {
        // Enter a name and change the location
        wrapper.instance().handleNameChange({target: {value: 'John Snow\'s collection'}});
        wrapper.instance().handleInputChange('location', 'my-custom-location');

        // Enter a new name
        wrapper.instance().handleNameChange({target: {value: 'Someone elses collection'}});
        expect(wrapper.instance().state.location).toEqual('my-custom-location');
    });
});

describe('saving', () => {
    const originalName = 'Collection';
    const originalDescription = 'description';
    const originalLocation = 'location';

    const name = 'New collection';
    const description = 'new-description';
    const location = 'new-location';

    beforeEach(() => {
        collectionEditor = (
            <CollectionEditor
                editing
                title="title"
                name={originalName}
                description={originalDescription}
                type="LOCAL_FILE"
                location={originalLocation}
                onClose={closeCallback}
                onSave={saveCallback}
                editType
            />
        );
    });

    it('invokes the save callback with existing parameters if nothing is entered', () => {
        const wrapper = shallow(collectionEditor);

        wrapper.instance().handleSave();

        // Make sure it is properly saved
        expect(saveCallback.mock.calls.length).toEqual(1);
        expect(saveCallback.mock.calls[0]).toEqual([originalName, originalDescription, originalLocation, 'LOCAL_FILE']);
    });

    it('invokes the save callback with parameters entered by the user', () => {
        const wrapper = shallow(collectionEditor);

        // Enter data into each field
        wrapper.instance().handleInputChange('name', name);
        wrapper.instance().handleInputChange('description', description);
        wrapper.instance().handleInputChange('location', location);

        wrapper.instance().handleSave();

        // Make sure it is properly saved
        expect(saveCallback.mock.calls.length).toEqual(1);
        expect(saveCallback.mock.calls[0]).toEqual([name, description, location, 'LOCAL_FILE']);
    });

    it('does not invoke the save callback when no name is present', () => {
        const wrapper = shallow(collectionEditor);

        // Enter data into each field
        wrapper.instance().handleInputChange('name', '');
        wrapper.instance().handleInputChange('description', description);
        wrapper.instance().handleInputChange('location', location);

        wrapper.instance().handleSave();

        // Make sure it is properly saved
        expect(saveCallback.mock.calls.length).toEqual(0);
    });

    it('does not invoke the save callback when no name is present', () => {
        const wrapper = shallow(collectionEditor);

        // Enter data into each field
        wrapper.instance().handleInputChange('name', name);
        wrapper.instance().handleInputChange('description', description);
        wrapper.instance().handleInputChange('location', '');

        wrapper.instance().handleSave();

        // Make sure it is properly saved
        expect(saveCallback.mock.calls.length).toEqual(0);
    });
});
