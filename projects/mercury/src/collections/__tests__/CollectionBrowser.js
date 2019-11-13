import React from 'react';
import {mount, shallow} from "enzyme";
import {MemoryRouter} from "react-router-dom";
import {LoadingInlay, MessageDisplay} from '@fairspace/shared-frontend';

import CollectionsContext from "../../common/contexts/CollectionsContext";
import ContextualCollectionBrowser, {CollectionBrowser} from "../CollectionBrowser";
import {act} from 'react-dom/test-utils';

let collectionBrowser;

const collectionsContextMock = {
    addCollection: jest.fn(() => Promise.resolve())
};

beforeEach(() => {
    collectionBrowser = (
        <MemoryRouter>
            <CollectionsContext.Provider value={collectionsContextMock}>
                <ContextualCollectionBrowser />
            </CollectionsContext.Provider>
        </MemoryRouter>
    );
});

describe('<CollectionBrowser />', () => {
    it('should dispatch an action on collection save', async () => {
        const wrapper = mount(collectionBrowser);

        const addButton = wrapper.find('[aria-label="Add"]').first();
        addButton.simulate('click');

        const nameField = wrapper.find('input#name').first();
        nameField.simulate('focus');
        nameField.simulate('change', {target: {value: 'New collection'}});

        const locationField = wrapper.find('input#location').first();
        locationField.simulate('focus');
        locationField.simulate('change', {target: {value: 'new-collection'}});

        const saveButton = wrapper.find('button[aria-label="Save"]').first();
        saveButton.simulate('click');

        expect(collectionsContextMock.addCollection.mock.calls.length).toEqual(1);
    });

    it('is loading as long as the user, users or collections are pending', () => {
        const wrapper = shallow(<CollectionBrowser loading />);

        expect(wrapper.find(LoadingInlay).length).toBe(1);
    });

    it('is in error state when user fetching failed', () => {
        const wrapperErrorObj = shallow(<CollectionBrowser error={new Error()} />);
        const wrapperErrorText = shallow(<CollectionBrowser error="some error" />);

        expect(wrapperErrorObj.find(MessageDisplay).length).toBe(1);
        expect(wrapperErrorText.find(MessageDisplay).length).toBe(1);
    });
});
