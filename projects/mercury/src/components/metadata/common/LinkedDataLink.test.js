import React from 'react';
import {shallow} from "enzyme";
import {Link} from "react-router-dom";
import LinkedDataLink from "./LinkedDataLink";

describe('MetadataLink', () => {
    // Please note that for tests, the window.location.origin is set to http://localhost
    const pathname = '/uri/test/abc';
    const search = '?query';
    const hash = '#hash';
    const origin = 'http://localhost';
    const pathAndParams = `${pathname}${search}${hash}`;

    it('should render internal link for uri with same hostname', () => {
        const wrapper = shallow(<LinkedDataLink uri={`${origin}${pathname}${search}${hash}`} />);
        expect(wrapper.containsMatchingElement(<Link to={{pathname, search, hash}} />)).toBe(true);
    });

    it('should render internal link for uri with same hostname (URI includes port)', () => {
        const wrapper = shallow(<LinkedDataLink uri={`${origin}:8000${pathname}${search}${hash}`} />);
        expect(wrapper.containsMatchingElement(<Link to={{pathname, search, hash}} />)).toBe(true);
    });

    it('should render external link for uri with other hostname', () => {
        const uri = `http://other-host${pathAndParams}`;
        const wrapper = shallow(<LinkedDataLink uri={uri} />);
        expect(wrapper.containsMatchingElement(<a href={uri} />)).toBe(true);
    });

    it('should treat changes in scheme as foreign', () => {
        const uri = `https://localhost${pathAndParams}`;
        const wrapper = shallow(<LinkedDataLink uri={uri} />);
        expect(wrapper.contains(<a href={uri} />)).toBe(true);
    });
});
