import MetadataProperty from "./MetadataProperty"
import React from 'react';
import {mount} from "enzyme";

let mockMetadataAPI;

beforeEach(() => {
    mockMetadataAPI = {
        update: jest.fn(() => Promise.resolve())
    };
});

it('handles updates correctly', () => {
    const subject = 'https://thehyve.nl';
    const property = {key: 'description', range: 'http://www.w3.org/TR/xmlschema11-2/#string', label: 'Description', values: [{value: 'More info'}, {value: 'My first collection'}]};
    const wrapper = mount(<MetadataProperty metadataAPI={mockMetadataAPI} property={property} subject={subject} />);

    const input = wrapper.find('input').first();
    input.simulate('focus');
    input.simulate('change', { target: { value: 'New more info' }});
    input.simulate('blur');

    expect(mockMetadataAPI.update.mock.calls.length).toEqual(1);
    expect(mockMetadataAPI.update.mock.calls[0][0]).toEqual('https://thehyve.nl');
    expect(mockMetadataAPI.update.mock.calls[0][1]).toEqual('description');
    expect(mockMetadataAPI.update.mock.calls[0][2][0].value).toEqual('New more info');
    expect(mockMetadataAPI.update.mock.calls[0][2][1].value).toEqual('My first collection');
});

it('does not update when input does not change', () => {
    const subject = 'https://thehyve.nl';
    const property = {key: 'description', range: 'http://www.w3.org/TR/xmlschema11-2/#string', label: 'Description', values: [{value: 'More info'}, {value: 'My first collection'}]};
    const wrapper = mount(<MetadataProperty metadataAPI={mockMetadataAPI} property={property} subject={subject} />);

    const input = wrapper.find('input').first();
    input.simulate('focus');
    input.simulate('change', { target: { value: 'More info' }});
    input.simulate('blur');

    expect(mockMetadataAPI.update.mock.calls.length).toEqual(0);
});


