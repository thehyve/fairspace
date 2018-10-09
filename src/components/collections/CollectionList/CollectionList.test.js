import React from 'react';
import ReactDOM from 'react-dom';
import CollectionList from "./CollectionList";
import {COLLECTION_ICONS} from "./CollectionList"
import {shallow} from "enzyme";
import Icon from "@material-ui/core/Icon";

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CollectionList />, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('renders without crashing with elements', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CollectionList collections={[]}/>, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('renders separate icon for s3 buckets', () => {
    const collections = [
        {type: 'LOCAL_STORAGE', name: 'Test1', id: '1'},
        {type: 'S3_BUCKET', name: 'Test2', id: '2'},
        {name: 'Test3', id: '3'}
    ]

    const wrapper = shallow(<CollectionList collections={collections}/>);

    const icons = wrapper.find(Icon);
    expect(icons.length).toEqual(3);
    expect(icons.get(0).props.children).toEqual(COLLECTION_ICONS['LOCAL_STORAGE']);
    expect(icons.get(1).props.children).toEqual(COLLECTION_ICONS['S3_BUCKET']);
    expect(icons.get(2).props.children).toEqual(COLLECTION_ICONS['LOCAL_STORAGE']);
});
