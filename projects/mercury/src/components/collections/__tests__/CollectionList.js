import React from 'react';
import ReactDOM from 'react-dom';
import {TableBody, TableCell, TableHead} from "@material-ui/core";
import CollectionList from "../CollectionList";
import {mount} from "enzyme";

describe('CollectionList', () => {
    const dateCreated = new Date();
    const collections = [{
        name: 'My Collection',
        creatorObj: {
            name: 'Mariah Carey'
        },
        dateCreated: dateCreated.toUTCString(),
        iri: 'http://example.com/0'
    }];

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<CollectionList />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('renders without crashing with elements', () => {
        const div = document.createElement('div');
        ReactDOM.render(<CollectionList collections={[]} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });

    it('renders correct header columns', () => {
        const wrapper = mount(<CollectionList collections={collections} />);
        const headerCells = wrapper.find(TableHead).find(TableCell);

        expect(headerCells.map(c => c.text())).toEqual(expect.arrayContaining(['Name', 'Creator', 'Created']));
    });

    it('renders correct values columns', () => {
        const wrapper = mount(<CollectionList collections={collections} />);
        const bodyCells = wrapper.find(TableBody).find(TableCell);

        expect(bodyCells.map(c => c.text())).toEqual(expect.arrayContaining(['My Collection', 'Mariah Carey']));
    });
});
