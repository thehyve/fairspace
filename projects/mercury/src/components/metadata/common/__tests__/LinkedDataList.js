/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import {mount} from "enzyme";
import {TableHead, TableBody, TableRow, TableCell} from "@material-ui/core";
import LinkedDataList from "../LinkedDataList";

describe('LinkedDataList', () => {
    it('should show match column if hasHighlights is set to true', () => {
        const wrapper = mount(<LinkedDataList hasHighlights />);
        const headings = wrapper.find(TableHead).at(0).find(TableCell).map(c => c.text());
        expect(headings).toEqual(expect.arrayContaining(["Match"]));
    });
    it('should not show match column if hasHighlights is set to false', () => {
        const wrapper = mount(<LinkedDataList hasHighlight={false} />);
        const headings = wrapper.find(TableHead).at(0).find(TableCell).map(c => c.text());
        expect(headings).not.toEqual(expect.arrayContaining(["Match"]));
    });
    it('should render the type of an entry according to the render function specified', () => {
        const entities = [
            {id: 'a', primaryText: 'b', secondaryText: 'c', highlights: 'd'},
            {id: 'second-entity'},
        ];
        const typeRender = jest.fn(() => 'rendered-type');

        const wrapper = mount(<LinkedDataList
            entities={entities}
            typeRender={typeRender}
        />);

        // Expect calls to typeRender
        expect(typeRender.mock.calls.length).toEqual(2);
        expect(typeRender.mock.calls.map(call => call[0])).toEqual(entities);

        // Expect the type to be shown
        wrapper.find(TableBody).at(0).find(TableRow).forEach(row => {
            expect(row.find(TableCell).map(c => c.text())).toEqual(expect.arrayContaining(['rendered-type']));
        });
    });
});
