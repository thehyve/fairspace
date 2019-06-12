import React from 'react';
import {shallow} from "enzyme";

import LinkedDataDropdown from '../LinkedDataDropdown';
import {SearchAPI} from "../../../../services/SearchAPI";
import {MessageDisplay} from "../../../common";
import Dropdown from '../values/Dropdown';

let mockClient;
let searchAPI;

describe('LinkedDataDropdown', () => {
    beforeEach(() => {
        mockClient = {
            search: jest.fn(() => Promise.resolve())
        };
        searchAPI = new SearchAPI(mockClient);
    });

    const property = {
        className: "http://workspace.ci.fairway.app/vocabulary/PersonConsent"
    };

    it('fires a call to search with an array for types containing classname of the property', () => {
        shallow(<LinkedDataDropdown property={property} searchAPI={searchAPI} />);
        expect(mockClient.search.mock.calls.length).toEqual(1);
        expect(mockClient.search.mock.calls[0][0].body.query.bool.filter[0].terms['type.keyword'])
            .toEqual(['http://workspace.ci.fairway.app/vocabulary/PersonConsent']);
    });

    it('shows an error message in case of an error', () => {
        const wrapper = shallow(<LinkedDataDropdown property={property} searchAPI={searchAPI} />);
        wrapper.setState({error: {message: 'some error'}});
        const error = wrapper.find(MessageDisplay);
        expect(error.length).toEqual(1);
    });

    it('should render the dropdown with proper options', () => {
        const wrapper = shallow(<LinkedDataDropdown property={property} searchAPI={searchAPI} />);
        wrapper.setState({
            fetchedItems: [
                {
                    type: [
                        "http://fairspace.io/ontology#DatatypePropertyShape"
                    ],
                    name: [
                        "Multi line string"
                    ],
                    id: "http://localhost/vocabulary/multiLineStringWidgetShape"
                }
            ]
        });

        const dropdown = wrapper.find(Dropdown);
        expect(dropdown.length).toEqual(1);
        expect(dropdown.props().options).toEqual([
            {
                disabled: false,
                id: "http://localhost/vocabulary/multiLineStringWidgetShape",
                label: "Multi line string",
            },
        ]);
    });
});
