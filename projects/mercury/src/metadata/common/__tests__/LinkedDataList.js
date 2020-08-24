import React from 'react';
import {mount} from "enzyme";
import {TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import LinkedDataList from "../LinkedDataList";

describe('LinkedDataList', () => {
    it('should show match column if hasHighlights is set to true', () => {
        const wrapper = mount(<LinkedDataList total={1} hasHighlights />);
        const headings = wrapper.find(TableHead).at(0).find(TableCell).map(c => c.text());
        expect(headings).toEqual(expect.arrayContaining(["Match"]));
    });

    it('should not show match column if hasHighlights is set to false', () => {
        const wrapper = mount(<LinkedDataList total={1} hasHighlight={false} />);
        const headings = wrapper.find(TableHead).at(0).find(TableCell).map(c => c.text());
        expect(headings).not.toEqual(expect.arrayContaining(["Match"]));
    });

    it('should render the type of an entry', () => {
        const entities = [
            {id: 'a', primaryText: 'b', secondaryText: 'c', highlights: 'd', typeLabel: 'analysis'},
            {id: 'second-entity', typeLabel: 'analysis'},
        ];

        const wrapper = mount(<LinkedDataList
            entities={entities}
            total={2}
        />);

        // Expect the type to be shown
        wrapper.find(TableBody).at(0).find(TableRow).forEach(row => {
            expect(row.find(TableCell).map(c => c.text())).toEqual(expect.arrayContaining(['analysis']));
        });
    });
});
