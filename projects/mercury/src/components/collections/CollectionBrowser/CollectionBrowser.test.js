import React from 'react';
import ReactDOM from 'react-dom';
import {mount, shallow} from "enzyme";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import {MemoryRouter} from "react-router-dom";
import {Provider} from "react-redux";
import CollectionBrowser from "./CollectionBrowser";
import mockStore from "../../../store/mockStore";
import Config from "../../../services/Config/Config";

let store; let
    collectionBrowser;
const defaultState = {
    account: {
        user: {
            data: {username: 'test'},
            pending: false,
            error: false,
        }
    },
    cache: {
        collections: {
            data: [],
            pending: false,
            error: false,
        },
        users: {
            data: [],
            pending: false,
            error: false,
        }
    },
    collectionBrowser: {}
};

beforeEach(() => {
    window.fetch = jest.fn(() => Promise.resolve());

    store = mockStore(defaultState);

    collectionBrowser = (
        <MemoryRouter>
            <Provider store={store}>
                <CollectionBrowser />
            </Provider>
        </MemoryRouter>
    );

    Config.setConfig({
        urls: {
            collections: "/collections"
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

    // There should be one action for closing the path
    expect(store.getActions().length).toEqual(1);

    // Setup proper state
    const addButton = wrapper
        .find(Fab)
        .filter('[aria-label="Add"]')
        .first();
    // Click on Add button
    addButton.simulate('click');

    // Click save in the dialog
    const saveButton = wrapper
        .find(Button)
        .filter('[aria-label="Save"]')
        .first();
    saveButton.simulate('click');

    // Expect the collection to be created in storage
    expect(store.getActions().length).toEqual(2);
});

describe('loading state', () => {
    it('is loading as long as the user is pending', () => {
        store = mockStore({
            ...defaultState,
            account: {
                user: {
                    ...defaultState.account.user,
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
                    ...defaultState.cache.collections,
                    pending: true
                },
                users: defaultState.cache.users
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('loading')).toEqual(true);
    });

    it('is loading as long as the users are pending', () => {
        store = mockStore({
            ...defaultState,
            cache: {
                users: {
                    ...defaultState.cache.users,
                    pending: true
                },
                collections: defaultState.cache.collections
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
                    ...defaultState.account.user,
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
                    ...defaultState.cache.collections,
                    error: new Error('Test')
                },
                users: {
                    ...defaultState.cache.users,
                    error: false
                }
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('error')).toEqual(new Error('Test'));
    });

    it('is in error state when the users fetching failed', () => {
        store = mockStore({
            ...defaultState,
            cache: {
                users: {
                    ...defaultState.cache.users,
                    error: new Error('Test')
                },
                collections: {
                    ...defaultState.cache.collections,
                    error: null
                }
            },
        });

        const node = shallow(<CollectionBrowser store={store} />);

        expect(node.prop('error')).toEqual(new Error('Test'));
    });
});
