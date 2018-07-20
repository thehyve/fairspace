import React from 'react';
import ReactDOM from 'react-dom';
import CollectionList from "./CollectionList";

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
