import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from "react-router-dom";
import configureStore from 'redux-mock-store';
import {mount} from "enzyme";
import thunk from 'redux-thunk';
import promiseMiddleware from "redux-promise-middleware";
import AuthorizationCheck from './AuthorizationCheck';

const middlewares = [thunk, promiseMiddleware()];
const mockStore = configureStore(middlewares);

it('renders without crashing', () => {
    const store = mockStore({account: {user: {}, authorizations: {}}});
    const element = (
        <MemoryRouter>
            <AuthorizationCheck store={store}>Children</AuthorizationCheck>
        </MemoryRouter>
    );

    const div = document.createElement('div');

    ReactDOM.render(element, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('renders content if no authorization is specified', () => {
    const store = mockStore({account: {user: {}, authorizations: {data: []}}});
    const element = (
        <MemoryRouter>
            <AuthorizationCheck store={store}>Children</AuthorizationCheck>
        </MemoryRouter>
    );

    const wrapper = mount(element);

    expect(wrapper.text()).toEqual('Children');
});

it('renders content if existing authorization is specified', () => {
    const store = mockStore({account: {user: {}, authorizations: {data: ['authorization']}}});
    const element = (
        <MemoryRouter>
            <AuthorizationCheck authorization="authorization" store={store}>Children</AuthorizationCheck>
        </MemoryRouter>
    );

    const wrapper = mount(element);

    expect(wrapper.text()).toEqual('Children');
});

it('does not render content if existing authorization is specified', () => {
    const store = mockStore({account: {user: {}, authorizations: {data: ['authorization']}}});
    const element = (
        <MemoryRouter>
            <AuthorizationCheck authorization="non-existing" store={store}>Children</AuthorizationCheck>
        </MemoryRouter>
    );

    const wrapper = mount(element);

    expect(wrapper.text()).not.toEqual('Children');
    expect(wrapper.text()).toContain('Error');
});
