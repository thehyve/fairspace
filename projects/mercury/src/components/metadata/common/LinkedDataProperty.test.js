import React from 'react';
import {mount} from "enzyme";
import {FormGroup, FormControlLabel} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

import {STRING_URI} from "../../../constants";
import LinkedDataProperty from "./LinkedDataProperty";
import StringValue from "./values/StringValue";

const defaultProperty = {
    key: 'description',
    datatype: STRING_URI,
    label: 'Description',
    values: [{value: 'More info'}, {value: 'My first collection'}, {value: 'My second collection'}],
    maxValuesCount: 4,
    isEditable: true
};

describe('LinkedDataProperty elements', () => {
    it('shows all provided values', () => {
        const property = {
            ...defaultProperty,
            maxValuesCount: 1
        };

        const wrapper = mount(<LinkedDataProperty property={property} />);
        const listItems = wrapper.find(FormGroup).find(FormControlLabel);

        expect(listItems.length).toEqual(3);
    });

    it('shows an add element if multiple values are allowed, and it is editable', () => {
        const wrapper = mount(<LinkedDataProperty property={defaultProperty} />);

        const listItems = wrapper.find(FormGroup).find(FormControlLabel);
        expect(listItems.length).toEqual(4);
        const deletIcons = wrapper.find(FormGroup).find(ClearIcon);
        expect(deletIcons.length).toEqual(3);
    });

    it('shows no add element if multiple values are allowed, but it is uneditable', () => {
        const wrapper = mount(<LinkedDataProperty property={{...defaultProperty, isEditable: false}} />);

        const listItems = wrapper.find(FormGroup).find(FormControlLabel);
        expect(listItems.length).toEqual(3);
        const deletIcons = wrapper.find(FormGroup).find(ClearIcon);
        expect(deletIcons.length).toEqual(0);
    });

    it('shows an add element if there is no value yet, and it is editable', () => {
        const property = {
            ...defaultProperty,
            values: []
        };

        const wrapper = mount(<LinkedDataProperty property={property} />);

        const listItems = wrapper.find(FormGroup).find(FormControlLabel);
        expect(listItems.length).toEqual(1);

        // Assert contents of the single component
        const inputComponent = listItems.at(0).find(StringValue);
        expect(inputComponent.prop('entry')).toEqual({value: ""});
    });

    it('shows no add element if there is no value yet, but it is uneditable', () => {
        const property = {
            ...defaultProperty,
            isEditable: false,
            values: []
        };

        const wrapper = mount(<LinkedDataProperty property={property} />);

        const listItems = wrapper.find(FormGroup).find(FormControlLabel);
        expect(listItems.length).toEqual(0);
    });

    it('does not show an add element if one value has been provided already, and it is editable', () => {
        const property = {
            ...defaultProperty,
            values: [{value: 'More info'}],
            maxValuesCount: 1
        };

        const wrapper = mount(<LinkedDataProperty property={property} />);

        const listItems = wrapper.find(FormGroup).find(FormControlLabel);
        expect(listItems.length).toEqual(1);

        // Assert contents of the single component
        const inputComponent = listItems.at(0).find(StringValue);
        expect(inputComponent.prop('entry').value).toEqual('More info');
    });

    it('does not show an add element if multiples values are provided, but it is not editable', () => {
        const property = {
            ...defaultProperty,
            values: [{value: 'More info'}, {value: 'another info'}],
            maxValuesCount: 2
        };

        const wrapper = mount(<LinkedDataProperty property={property} />);
        const listItems = wrapper.find(FormGroup).find(FormControlLabel);
        expect(listItems.length).toEqual(2);
    });
});
