/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import {configure, mount} from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

import {Router} from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import {createMemoryHistory} from 'history';
import LinkedDataLink from "../LinkedDataLink";
import {METADATA_PATH} from "../../../constants";
import UserContext from '../../../users/UserContext';

// Enzyme is obsolete, the Adapter allows running our old tests.
// For new tests use React Testing Library. Consider migrating enzyme tests when refactoring.
configure({adapter: new Adapter()});

describe('LinkedDataLink', () => {
    it('should render internal link for any uri', () => {
        const history: History = createMemoryHistory();
        history.push = jest.fn();

        const wrapper = mount(
            <UserContext.Provider value={{currentUser: {canViewPublicMetadata: true}}}>
                <Router history={history}>
                    <LinkedDataLink uri="http://google.nl/some-path?search#hash">Go</LinkedDataLink>
                </Router>
            </UserContext.Provider>
        );

        expect(wrapper.find('a').isEmpty()).toBeFalsy();
        const anchor = wrapper.find('a').first();
        const expectedLocation = `${METADATA_PATH}?iri=${encodeURIComponent("http://google.nl/some-path?search#hash")}`;
        expect(anchor.prop('href')).toEqual(expectedLocation);
        expect(anchor.text()).toEqual('Go');
        expect(anchor.prop('onClick')).toBeTruthy();

        anchor.prop('onClick')(new MouseEvent('click'));
        expect(history.push).toBeCalledTimes(1);
        expect(history.push).toBeCalledWith({
            pathname: METADATA_PATH,
            search: `?iri=${encodeURIComponent("http://google.nl/some-path?search#hash")}`
        });
    });

    it('should display child elements for users without access to public metadata', () => {
        const history: History = createMemoryHistory();
        history.push = jest.fn();

        const wrapper = mount(
            <UserContext.Provider value={{currentUser: {canViewPublicMetadata: false}}}>
                <Router history={history}>
                    <LinkedDataLink uri="http://google.nl/some-path?search#hash">Go</LinkedDataLink>
                </Router>
            </UserContext.Provider>
        );

        expect(wrapper.find('a').isEmpty()).toBeTruthy();
        expect(wrapper.text()).toEqual('Go');
    });

    it('should not break on an invalid url (return children only)', () => {
        const uri = `some-invalid-url`;
        const history: History = createMemoryHistory();
        history.push = jest.fn();

        const wrapper = mount(
            <UserContext.Provider value={{currentUser: {canViewPublicMetadata: true}}}>
                <Router history={history}>
                    <LinkedDataLink uri={uri}>something</LinkedDataLink>
                </Router>
            </UserContext.Provider>
        );

        expect(wrapper.find('a').isEmpty()).toBeFalsy();
        const anchor = wrapper.find('a').first();
        const expectedLocation = `${METADATA_PATH}?iri=${encodeURIComponent(uri)}`;
        expect(anchor.prop('href')).toEqual(expectedLocation);
        expect(anchor.text()).toEqual('something');
        expect(anchor.prop('onClick')).toBeTruthy();

        anchor.prop('onClick')(new MouseEvent('click'));
        expect(history.push).toBeCalledTimes(1);
        expect(history.push).toBeCalledWith({
            pathname: METADATA_PATH,
            search: `?iri=${encodeURIComponent(uri)}`
        });
    });
});
