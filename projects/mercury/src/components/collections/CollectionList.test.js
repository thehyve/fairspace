import React from 'react';
import ReactDOM from 'react-dom';
import {TableCell} from "@material-ui/core";
import {createShallow} from '@material-ui/core/test-utils';
import CollectionList from "./CollectionList";

const shallow = createShallow({dive: true});

describe('CollectionList', () => {
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

    it('renders Creator column', () => {
        const collections = [{creatorObj: {firstName: 'Mariah', lastName: 'Carey'}, iri: 'http://example.com/0'}];
        const wrapper = shallow(<CollectionList collections={collections} />);
        const cells = wrapper.dive().find(TableCell);
        expect(cells.at(2).childAt(0).text()).toEqual('Creator');
        expect(cells.at(5).childAt(0).text()).toEqual('Mariah Carey');
    });

    it('renders Created column', () => {
        const date = new Date();
        const collections = [{dateCreated: date.toUTCString(), iri: 'http://example.com/0'}];
        const wrapper = shallow(<CollectionList collections={collections} />);
        const cells = wrapper.dive().find(TableCell);
        expect(cells.at(1).childAt(0).text()).toEqual('Created');
        expect(cells.at(4).childAt(0).html()).toContain('M');
    });
});
