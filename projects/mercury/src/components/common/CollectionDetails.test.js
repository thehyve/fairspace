import React from 'react';
import {mount} from 'enzyme';
import CollectionDetails, {ICONS} from "./CollectionDetails";

describe('<CollectionDetails />', () => {
    it('renders proper icon for local storage collection', () => {
        const dateCreated = new Date().toUTCString();
        const collection = {type: 'LOCAL_STORAGE', name: 'Test1', id: '1', dateCreated};
        const wrapper = mount(<CollectionDetails collection={collection} />);

        expect(wrapper.contains(ICONS.LOCAL_STORAGE)).toBeTruthy();
    });
});
