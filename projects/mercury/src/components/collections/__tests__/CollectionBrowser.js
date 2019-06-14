import React from 'react';
import ReactDOM from 'react-dom';
import {mount, shallow} from "enzyme";
import {MemoryRouter} from "react-router-dom";
import {Provider} from "react-redux";
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";

import CollectionBrowser from "../CollectionBrowser";
import Config from "../../../services/Config/Config";
import * as actionTypes from "../../../actions/actionTypes";
import UserContext from '../../../UserContext';
import {LoadingInlay} from "../../common";

const middlewares = [thunk, promiseMiddleware];
const mockStore = configureStore(middlewares);

let store;
let collectionBrowser;
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

it('dispatch an action on collection save', () => {
    const wrapper = mount(collectionBrowser);

    const addButton = wrapper.find('[aria-label="Add"]').first();
    addButton.simulate('click');

    const nameField = wrapper.find('input#name').first();
    nameField.simulate('focus');
    nameField.simulate('change', {target: {value: 'New collection'}});

    const locationField = wrapper.find('input#location').first();
    locationField.simulate('focus');
    locationField.simulate('change', {target: {value: 'new-collection'}});

    const saveButton = wrapper.find('button[aria-label="Save"]').first();
    saveButton.simulate('click');

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0].type).toBe(actionTypes.ADD_COLLECTION_PENDING);
});

describe('loading state', () => {
    it('is loading as long as the user is pending', () => {
        const wrapper = shallow(
            <UserContext.Provider value={{currentUserLoading: true}}>
                <CollectionBrowser />
            </UserContext.Provider>
        );

        expect(wrapper.find(LoadingInlay).length).toBe(1);
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
