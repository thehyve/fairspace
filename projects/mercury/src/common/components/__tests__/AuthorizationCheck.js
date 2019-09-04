import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from "enzyme";

import {AuthorizationCheck} from '../AuthorizationCheck';

it('renders without crashing', () => {
    const element = (
        <AuthorizationCheck>Children</AuthorizationCheck>
    );

    const div = document.createElement('div');

    ReactDOM.render(element, div);
    ReactDOM.unmountComponentAtNode(div);
});

it('renders content if no authorization is specified', () => {
    const element = (
        <AuthorizationCheck authorizations={[]}>Children</AuthorizationCheck>
    );

    const wrapper = mount(element);

    expect(wrapper.text()).toEqual('Children');
});

it('renders content if existing authorization is specified', () => {
    const element = (
        <AuthorizationCheck authorization="authorization" authorizations={['authorization']}>Children</AuthorizationCheck>
    );

    const wrapper = mount(element);

    expect(wrapper.text()).toEqual('Children');
});

it('does not render content if existing authorization is specified', () => {
    const element = (
        <AuthorizationCheck authorization="non-existing" authorizations={['authorization']}>Children</AuthorizationCheck>
    );

    const wrapper = mount(element);

    expect(wrapper.text()).not.toEqual('Children');
    expect(wrapper.text()).toContain('Error');
});
