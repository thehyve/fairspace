/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';
import {shallow} from "enzyme";
import {Link} from "react-router-dom";
import LinkedDataLink from "../LinkedDataLink";

describe('MetadataLink', () => {
    // Please note that for tests, the window.location.origin is set to http://localhost
    const editorPath = '/editor';
    const search = '?iri=';

    it('should render internal link for any uri', () => {
        const wrapper = shallow(<LinkedDataLink editorPath={editorPath} uri="http://google.nl/some-path?search#hash" />);
        expect(wrapper.containsMatchingElement(<Link to={{pathname: editorPath, search: search + encodeURIComponent("http://google.nl/some-path?search#hash")}} />)).toBe(true);
    });

    it('should not break on an invalid url (return children only)', () => {
        const uri = `some-invalid-url`;
        const wrapper = shallow(<LinkedDataLink editorPath={editorPath} uri={uri}>something</LinkedDataLink>);
        expect(wrapper.containsMatchingElement(<Link to={{pathname: editorPath, search: "?iri=some-invalid-url"}}>something</Link>)).toBe(true);
    });
});
