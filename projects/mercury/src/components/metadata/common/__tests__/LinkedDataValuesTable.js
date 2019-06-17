import React from 'react';
import {shallow} from "enzyme";
import {Button, TableBody, TableCell, TableFooter, TableHead, TableRow} from '@material-ui/core';

import {STRING_URI} from "../../../../constants";
import {LinkedDataValuesTable} from "../LinkedDataValuesTable";
import StringValue from "../values/StringValue";

const defaultProperty = {
    key: 'description',
    datatype: STRING_URI,
    label: 'Description',
    values: [{value: 'More info'}, {value: 'My first collection'}, {value: 'My second collection'}],
    maxValuesCount: 4,
    isEditable: true
};

describe('LinkedDataValuesTable elements', () => {
    it('should show a row for all provided values', () => {
        const wrapper = shallow(<LinkedDataValuesTable property={defaultProperty} />);
        const rows = wrapper.find(TableBody).find(TableRow);
        expect(rows.length).toEqual(3);
    });

    it('should render the columns as specified', () => {
        const wrapper = shallow(
            <LinkedDataValuesTable
                property={{...defaultProperty, isEditable: false}}
                columnDefinitions={[
                    {id: 'a', label: 'first', getValue: entry => entry.value},
                    {id: 'b', label: 'second', getValue: () => 'constant'},
                ]}
            />
        );

        const headerCells = wrapper.find(TableHead).find(TableCell);
        expect(headerCells.map(cell => cell.render().text())).toEqual(['first', 'second']);

        const rows = wrapper.find(TableBody).find(TableRow);
        const rowContents = rows.map(row => row.find(TableCell).map(cell => cell.render().text()));
        expect(rowContents).toEqual([['More info', 'constant'], ['My first collection', 'constant'], ['My second collection', 'constant']]);
    });

    it('should hide the header if requested', () => {
        const wrapper = shallow(<LinkedDataValuesTable showHeader={false} property={defaultProperty} />);
        expect(wrapper.find(TableHead).length).toEqual(0);
    });

    it('should show a delete button for editable properties', () => {
        const property = {
            ...defaultProperty,
            isEditable: true
        };
        const wrapper = shallow(<LinkedDataValuesTable property={property} />);
        expect(wrapper.find(TableHead).find(TableCell).length).toEqual(1);
        expect(wrapper.find(TableBody).find(TableRow).first().find(Button).length).toEqual(1);
    });

    it('should show an add input field when adding is allowed', () => {
        const wrapper = shallow(<LinkedDataValuesTable property={defaultProperty} canAdd addComponent={StringValue} />);
        expect(wrapper.find(TableFooter).find(TableCell).length).toEqual(2);
        expect(wrapper.find(TableFooter).find(TableCell).first().find(StringValue).length).toEqual(1);
    });
});
