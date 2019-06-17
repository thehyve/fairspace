import React from 'react';
import {shallow} from 'enzyme';

import LinkedDataDropdown from '../LinkedDataDropdown';
import {MessageDisplay} from '../../../common';
import Dropdown from '../values/Dropdown';

describe('LinkedDataDropdown', () => {
    const property = {
        className: 'http://workspace.ci.fairway.app/vocabulary/PersonConsent'
    };

    it('calls fetchItems with the given types', () => {
        const mockFetchItems = jest.fn(() => Promise.resolve());

        shallow(<LinkedDataDropdown property={property} fetchItems={mockFetchItems} />);

        expect(mockFetchItems.mock.calls.length).toEqual(1);
        expect(mockFetchItems.mock.calls[0][0].types)
            .toEqual(['http://workspace.ci.fairway.app/vocabulary/PersonConsent']);
    });

    it('shows an error message in case of an error', async () => {
        const mockFailedFetchItems = () => Promise.reject(new Error());

        const wrapper = shallow(<LinkedDataDropdown property={property} fetchItems={mockFailedFetchItems} />);

        try {
            await mockFailedFetchItems();
        } catch (e) {
            const error = wrapper.find(MessageDisplay);
            expect(error.length).toEqual(1);
        }
    });

    it('should render the dropdown with proper options', async () => {
        const id = 'http://localhost/vocabulary/multiLineStringWidgetShape';
        const name = 'Multi line string';

        const mockFetchItems = jest.fn(() => Promise.resolve({
            items: [
                {
                    type: ['http://fairspace.io/ontology#DatatypePropertyShape'],
                    name: [name],
                    id
                }
            ]
        }));

        const wrapper = shallow(<LinkedDataDropdown property={property} fetchItems={mockFetchItems} />);

        await mockFetchItems();

        const dropdown = wrapper.find(Dropdown);
        expect(dropdown.length).toEqual(1);
        expect(dropdown.props().options).toEqual([
            {
                disabled: false,
                id,
                label: name,
                otherEntry: {
                    type: ['http://fairspace.io/ontology#DatatypePropertyShape'],
                    name: [name],
                    id
                }
            },
        ]);
    });
});
