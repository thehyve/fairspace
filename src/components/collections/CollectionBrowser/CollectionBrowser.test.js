import React from 'react';
import ReactDOM from 'react-dom';
import CollectionBrowser from "./CollectionBrowser";
import {mount, shallow} from "enzyme";
import Button from "@material-ui/core/Button";
import {MemoryRouter} from "react-router-dom";
import {Provider} from "react-redux";
import mockStore from "../../../store/mockStore"
import Config from "../../../services/Config/Config";

let store, collectionBrowser;
const defaultState = {
    account: {
        user: {
            data: { username: 'test' }
        }
    },
    cache: {
        collections: {
            data: []
        }
    },
    collectionBrowser: {}
}

beforeEach(() => {
    window.fetch = jest.fn(() => Promise.resolve())

    store = mockStore(defaultState);

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

    // Click on Add button
    button.at(2).simulate('click');

    button = wrapper.find(Button);
    expect(button.length).toEqual(5);

    // Click on Save button
    button.at(4).simulate('click');

    // Expect the collection to be created in storage
    expect(store.getActions().length).toEqual(1);
});

describe('loading state', () => {
    it('is loading as long as the user is pending', () => {
        store = mockStore({
            ...defaultState,
            account: {
                user: {
                    ... defaultState.account.user,
                    pending: true
                }
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('loading')).toEqual(true);
    });

    it('is loading as long as the collections are pending', () => {
        store = mockStore({
            ...defaultState,
            cache: {
                collections: {
                    ... defaultState.cache.collections,
                    pending: true
                }
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('loading')).toEqual(true);
    });
});

describe('error state', () => {
    it('is in error state when user fetching failed', () => {
        store = mockStore({
            ...defaultState,
            account: {
                user: {
                    ... defaultState.account.user,
                    error: new Error('Test')
                }
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('error')).toEqual(new Error('Test'));
    });

    it('is in error state when the collections fetching failed', () => {
        store = mockStore({
            ...defaultState,
            cache: {
                collections: {
                    ... defaultState.cache.collections,
                    error: new Error('Test')
                }
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('error')).toEqual(new Error('Test'));
    });

});
