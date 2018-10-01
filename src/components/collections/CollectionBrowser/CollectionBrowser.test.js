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
    window.fetch = jest.fn(() => Promise.resolve())
    
    store = mockStore({
        account: {
            user: { data: { username: 'test' }}
        },
        cache: {
            collections: {
                pending: false,
                data: []
            }
        },
        collectionBrowser: {}
    });

    collectionBrowser = (
        <MemoryRouter>
            <Provider store={store}>
                <CollectionBrowser/>
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
    expect(store.getActions().length).toEqual(0);

    // Setup proper state
    let button = wrapper.find(Button);
    expect(button.length).toEqual(3);

    // Click on button
    button.at(2).simulate('click');

    // Expect the collection to be created in storage
    expect(store.getActions().length).toEqual(1);
});
