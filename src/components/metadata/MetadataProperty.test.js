import MetadataProperty from "./MetadataProperty"
import React from 'react';
import {mount} from "enzyme";
import mockStore from "../../store/mockStore"
import Config from "../generic/Config/Config";

beforeEach(() => {
    window.fetch = jest.fn(() => Promise.resolve({ok: true}));

    Config.setConfig({
        "urls": {
            "metadata": "/metadata"
        }
    });

    return Config.init();
});

it('handles updates correctly', () => {
    const subject = 'https://thehyve.nl';
    const property = {
        key: 'description',
        range: 'http://www.w3.org/TR/xmlschema11-2/#string',
        label: 'Description',
        values: [{index: 0, value: 'More info'}, {index: 1, value: 'My first collection'}]
    };
    const store = mockStore({})

    const wrapper = mount(<MetadataProperty store={store} property={property} subject={subject} />);

    const input = wrapper.find('input').first();
    input.simulate('focus');
    input.simulate('change', { target: { value: 'New more info' }});
    input.simulate('blur');

    wrapper.unmount();

    const actions = store.getActions();
    expect(actions.length).toEqual(1);
    expect(actions[0].meta.subject).toEqual('https://thehyve.nl');
});

it('does not update when input does not change', () => {
    const subject = 'https://thehyve.nl';
    const property = {
        key: 'description',
        range: 'http://www.w3.org/TR/xmlschema11-2/#string',
        label: 'Description',
        values: [{index: 0, value: 'More info'}, {index: 1, value: 'My first collection'}]
    };
    const store = mockStore({})
    const wrapper = mount(<MetadataProperty store={store} property={property} subject={subject} />);

    const input = wrapper.find('input').first();
    input.simulate('focus');
    input.simulate('change', { target: { value: 'More info' }});
    input.simulate('blur');

    wrapper.unmount();

    const actions = store.getActions();
    expect(actions.length).toEqual(0);
});


