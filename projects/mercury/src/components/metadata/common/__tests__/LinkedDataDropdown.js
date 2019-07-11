import React from 'react';
import {shallow} from 'enzyme';

import {LinkedDataDropdown} from '../LinkedDataDropdown';
import Dropdown from '../values/Dropdown';

describe('LinkedDataDropdown', () => {
    const property = {
        className: 'http://workspace.ci.fairway.app/vocabulary/PersonConsent'
    };

    it('calls fetchItems with the given types', () => {
        const mockFetchItems = jest.fn(() => Promise.resolve({items: []}));

        const wrapper = shallow(<LinkedDataDropdown debounce={0} types={['http://workspace.ci.fairway.app/vocabulary/PersonConsent']} fetchItems={mockFetchItems} />);

        const dropdown = wrapper.find(Dropdown);

        return dropdown.prop("loadOptions")().then(() => {
            expect(mockFetchItems.mock.calls.length).toEqual(1);
            expect(mockFetchItems.mock.calls[0][0].types)
                .toEqual(['http://workspace.ci.fairway.app/vocabulary/PersonConsent']);
        });
    });

});
