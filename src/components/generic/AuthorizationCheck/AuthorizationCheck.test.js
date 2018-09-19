import React from 'react';
import ReactDOM from 'react-dom';
import AuthorizationCheck from './AuthorizationCheck';
import {MemoryRouter} from "react-router-dom";
import configureStore from 'redux-mock-store'
import {mount} from "enzyme";

const middlewares = []
const mockStore = configureStore(middlewares)

it('renders without crashing', () => {
  const store = mockStore({account: { user: {}, authorizations: {} }});
  const element = <MemoryRouter><AuthorizationCheck store={store}>Children</AuthorizationCheck></MemoryRouter>;

  const div = document.createElement('div');

  ReactDOM.render(element, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders content if no authorization is specified', () => {
    const store = mockStore({account: { user: {}, authorizations: {items: []} }});
    const element = <MemoryRouter><AuthorizationCheck store={store}>Children</AuthorizationCheck></MemoryRouter>;

    const wrapper = mount(element)

    expect(wrapper.text()).toEqual('Children')
});

it('renders content if existing authorization is specified', () => {
    const store = mockStore({account: { user: {}, authorizations: {items: ['authorization']} }});
    const element = <MemoryRouter><AuthorizationCheck authorization='authorization' store={store}>Children</AuthorizationCheck></MemoryRouter>;

    const wrapper = mount(element)

    expect(wrapper.text()).toEqual('Children')
});

it('does not render content if existing authorization is specified', () => {
    const store = mockStore({account: { user: {}, authorizations: {items: ['authorization']} }});
    const element = <MemoryRouter><AuthorizationCheck authorization='non-existing' store={store}>Children</AuthorizationCheck></MemoryRouter>;

    const wrapper = mount(element)

    expect(wrapper.text()).not.toEqual('Children')
    expect(wrapper.text()).toContain('Error')
});
