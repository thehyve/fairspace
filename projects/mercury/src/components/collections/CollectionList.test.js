import React from 'react';
import ReactDOM from 'react-dom';
import Icon from "@material-ui/core/Icon";
import {TableCell} from "@material-ui/core";
import {createShallow} from '@material-ui/core/test-utils';
import CollectionList, {ICONS} from "./CollectionList";
import styles from './CollectionList.styles';

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

    it('renders separate icon for s3 buckets', () => {
        const dateCreated = new Date().toUTCString();
        const collections = [
            {type: 'LOCAL_STORAGE', name: 'Test1', id: '1', dateCreated},
            {type: 'S3_BUCKET', name: 'Test2', id: '2', dateCreated},
            {name: 'Test3', id: '3', dateCreated}
        ];

        const props = {
            classes: {
                tableRow: "CollectionList-tableRow-200",
                tableRowSelected: "CollectionList-tableRowSelected-201"
            }
        };
        const wrapper = shallow(<CollectionList collections={collections} {...props} />);

        const icons = wrapper.dive().find(Icon);
        expect(icons.length).toEqual(3);
        expect(icons.get(0).props.children).toEqual(ICONS.LOCAL_STORAGE);
        expect(icons.get(1).props.children).toEqual(ICONS.S3_BUCKET);
        expect(icons.get(2).props.children).toEqual(ICONS.LOCAL_STORAGE);
    });

    it('renders Creator column', () => {
        const collections = [{creatorObj: {firstName: 'Mariah', lastName: 'Carey'}, id: '0'}];
        const wrapper = shallow(<CollectionList collections={collections} classes={styles} />);
        const cells = wrapper.dive().find(TableCell);
        expect(cells.length).toEqual(12);
        expect(cells.at(3).childAt(0).text()).toEqual('Creator');
        expect(cells.at(9).childAt(0).childAt(0).text()).toEqual('Mariah Carey');
    });

    it('renders Access column', () => {
        const collections = [{access: 'Read', dateCreated: new Date().toUTCString(), id: '0'}];
        const wrapper = shallow(<CollectionList collections={collections} classes={styles} />);
        const cells = wrapper.dive().find(TableCell);
        expect(cells.length).toEqual(12);
        expect(cells.at(4).childAt(0).text()).toEqual('Access');
        expect(cells.at(10).childAt(0).text()).toEqual('Read');
    });

    it('renders Created column', () => {
        const date = new Date();
        const collections = [{dateCreated: date.toUTCString(), id: '0'}];
        const wrapper = shallow(<CollectionList collections={collections} classes={styles} />);
        const cells = wrapper.dive().find(TableCell);
        expect(cells.length).toEqual(12);
        expect(cells.at(2).childAt(0).text()).toEqual('Created');
        expect(cells.at(8).childAt(0).childAt(0).html()).toContain('M');
    });
});
