import React from 'react';
import {mount} from "enzyme";
import {TableHead, TableBody, TableRow, TableCell} from "@material-ui/core";
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

    it('should render the type of an entry according to the render function specified', () => {
        const entities = [
            {id: 'a', primaryText: 'b', secondaryText: 'c', highlights: 'd'},
            {id: 'second-entity'},
        ];
        const typeRender = jest.fn(() => 'rendered-type');

        const wrapper = mount(<LinkedDataList
            entities={entities}
            total={2}
            typeRender={typeRender}
        />);

        expect(typeRender).toHaveBeenCalledTimes(entities.length);
        expect(typeRender).toHaveBeenNthCalledWith(1, entities[0]);
        expect(typeRender).toHaveBeenNthCalledWith(2, entities[1]);

        // Expect the type to be shown
        wrapper.find(TableBody).at(0).find(TableRow).forEach(row => {
            expect(row.find(TableCell).map(c => c.text())).toEqual(expect.arrayContaining(['rendered-type']));
        });
    });
});
