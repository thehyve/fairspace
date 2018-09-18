import React from 'react';
import ReactDOM from 'react-dom';
import CollectionBrowser from "./CollectionBrowser";
import {mount} from "enzyme";
import Button from "@material-ui/core/Button";
import {MemoryRouter} from "react-router-dom";
import configureStore from 'redux-mock-store'

const middlewares = []
const mockStore = configureStore(middlewares)

let mockCollectionStore, mockFileStore, mockMetadataStore, mockFileStoreFactory, store;
let collectionBrowser;

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

beforeEach(() => {
    mockFileStoreFactory = {
        build: () => mockFileStore
    };

    mockMetadataStore = {}

    mockFileStore = {
        list: jest.fn(() => Promise.resolve()),
        upload: jest.fn(() => Promise.resolve()),
        download: jest.fn()
    };

    mockCollectionStore = {
        getCollections: jest.fn(() => Promise.resolve()),
        getCollection: jest.fn(() => Promise.resolve([])),
        addCollection: jest.fn(() => Promise.resolve([])),
    }

    store = mockStore({ account: { user: { item: { username: 'test' }} }});

    collectionBrowser = (
        <MemoryRouter>
            <CollectionBrowser
                store={store}
                collectionStore={mockCollectionStore}
                metadataStore={mockMetadataStore}
                fileStoreFactory={mockFileStoreFactory}
            />
        </MemoryRouter>
    )

});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(collectionBrowser, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('creates a new collection on button click', () => {
    const wrapper = mount(collectionBrowser);

    // Setup proper state
    wrapper.setState({loading: false});
    let button = wrapper.find(Button);
    expect(button.length).toEqual(2);

    // Click on button
    button.at(1).simulate('click');

    // Expect the collection to be created in storage
    expect(mockCollectionStore.addCollection.mock.calls.length).toEqual(1);
});
