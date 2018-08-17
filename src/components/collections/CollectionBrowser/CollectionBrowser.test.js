import React from 'react';
import ReactDOM from 'react-dom';
import CollectionBrowser from "./CollectionBrowser";
import InformationDrawer from "../InformationDrawer/InformationDrawer";
import {shallow, mount} from "enzyme";
import Button from "@material-ui/core/Button";
import Config from "../../generic/Config/Config";
import configFile from "../../../config";
import MemoryRouter from "react-router-dom/MemoryRouter";

beforeAll(() => {
    Config.setConfig(Object.assign(configFile, {
        "user": {
            "username": "John"
        }
    }));

    return Config.init();
});


let mockCollectionStore, mockFileStore, mockMetadataStore, mockFileStoreFactory;
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

    collectionBrowser = (
        <MemoryRouter>
            <CollectionBrowser
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
