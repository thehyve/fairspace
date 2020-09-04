/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import {mount} from "enzyme";
import {Router} from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import {createMemoryHistory} from 'history';
import LinkedDataLink from "../LinkedDataLink";
import {METADATA_PATH} from "../../../constants";

describe('LinkedDataLink', () => {
    it('should render internal link for any uri', () => {
        const history: History = createMemoryHistory();
        history.push = jest.fn();

        const wrapper = mount(
            <Router history={history}>
                <LinkedDataLink uri="http://google.nl/some-path?search#hash">Go</LinkedDataLink>
            </Router>
        );

        const anchor = wrapper.find('a').first();
        expect(anchor).toBeTruthy();
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

    it('should not break on an invalid url (return children only)', () => {
        const uri = `some-invalid-url`;
        const history: History = createMemoryHistory();
        history.push = jest.fn();

        const wrapper = mount(
            <Router history={history}>
                <LinkedDataLink uri={uri}>something</LinkedDataLink>
            </Router>
        );

        const anchor = wrapper.find('a').first();
        expect(anchor).toBeTruthy();
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
