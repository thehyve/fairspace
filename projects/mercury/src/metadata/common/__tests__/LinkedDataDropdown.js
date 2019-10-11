import React from 'react';
import {shallow} from 'enzyme';

import {LinkedDataDropdown} from '../LinkedDataDropdown';
import Dropdown from '../values/Dropdown';

describe('LinkedDataDropdown', () => {
    it('calls fetchItems with the given types', () => {
        const mockFetchItems = jest.fn(() => Promise.resolve({items: []}));

        const wrapper = shallow(<LinkedDataDropdown
            property={{}}
            debounce={0}
            types={['http://workspace.ci.fairway.app/vocabulary/PersonConsent']}
            fetchItems={mockFetchItems}
        />);

        const dropdown = wrapper.find(Dropdown);

        return dropdown.prop("loadOptions")()
            .then(() => {
                expect(mockFetchItems).toHaveBeenCalledTimes(1);
                expect(mockFetchItems)
                    .toHaveBeenCalledWith(expect.objectContaining({
                        types: ['http://workspace.ci.fairway.app/vocabulary/PersonConsent']
                    }));
            });
    });
});
