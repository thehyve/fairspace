import React from 'react';
import ReactDOM from 'react-dom';
import CollectionBrowser from "./CollectionBrowser";
import {mount} from "enzyme";
import Button from "@material-ui/core/Button";
import {MemoryRouter} from "react-router-dom";
import {Provider} from "react-redux";
import mockStore from "../../../store/mockStore"
import Config from "../../generic/Config/Config";

let mockCollectionAPI, mockFileAPI, mockMetadataAPI, mockFileAPIFactory, store;
let collectionBrowser;

function flushPromises() {
    return new Promise(resolve => setImmediate(resolve));
}

beforeEach(() => {
    mockFileAPIFactory = {
        build: () => mockFileAPI
    };

    mockMetadataAPI = {}

    mockFileAPI = {
        list: jest.fn(() => Promise.resolve()),
        upload: jest.fn(() => Promise.resolve()),
        download: jest.fn()
    };

    mockCollectionAPI = {
        getCollections: jest.fn(() => Promise.resolve()),
        getCollection: jest.fn(() => Promise.resolve([])),
        addCollection: jest.fn(() => Promise.resolve([])),
    }

    store = mockStore({
        account: {
            user: { data: { username: 'test' }}
        },
        cache: {
            collections: {}
        },
        collectionBrowser: {}
    });

    collectionBrowser = (
        <MemoryRouter>
            <Provider store={store}>
                <CollectionBrowser
                    collectionAPI={mockCollectionAPI}
                    metadataAPI={mockMetadataAPI}
                    fileAPIFactory={mockFileAPIFactory}
                />
            </Provider>
        </MemoryRouter>
    )

    Config.setConfig({
        "urls": {
            "collections": "/collections"
        }
    });

    return Config.init();

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
    expect(mockCollectionAPI.addCollection.mock.calls.length).toEqual(1);
});
