import React from 'react';
import ReactDOM from 'react-dom';
import {shallow} from "enzyme";
import CollectionOverview from "./CollectionOverview";

let mockCollectionAPI, overview;

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

beforeEach(() => {
    mockCollectionAPI = {
        getCollections: jest.fn(() => Promise.resolve()),
        getCollection: jest.fn(() => Promise.resolve([])),
        addCollection: jest.fn(() => Promise.resolve([])),
    }

    overview = (
        <CollectionOverview
            collectionAPI={mockCollectionAPI}
        />
    )

});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(overview, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('calls the getCollections API on load', () => {
    const wrapper = shallow(overview);

    expect(mockCollectionAPI.getCollections.mock.calls.length).toEqual(1);
});
