import React from 'react';
import {shallow} from "enzyme";
import {Link} from "react-router-dom";
import LinkedDataLink from "./LinkedDataLink";

describe('MetadataLink', () => {
    // Please note that for tests, the window.location.origin is set to http://localhost
    const pathAndParams = '/uri/test/abc?query#hash';
    const origin = 'http://localhost';

    it('should render internal link for uri with same hostname', () => {
        const wrapper = shallow(<LinkedDataLink uri={`${origin}${pathAndParams}`} />);
        expect(wrapper.containsMatchingElement(<Link to={pathAndParams} />)).toBe(true);
    });
    it('should render external link for uri with other hostname', () => {
        const uri = `http://other-host${pathAndParams}`;
        const wrapper = shallow(<LinkedDataLink uri={uri} />);
        expect(wrapper.containsMatchingElement(<a href={uri} />)).toBe(true);
    });

    it('should treat changes in scheme or port as foreign', () => {
        let wrapper; let uri;

        uri = `https://localhost${pathAndParams}`;
        wrapper = shallow(<LinkedDataLink uri={uri} />);
        expect(wrapper.contains(<a href={uri} />)).toBe(true);

        uri = `http://localhost:8080${pathAndParams}`;
        wrapper = shallow(<LinkedDataLink uri={uri} />);
        expect(wrapper.contains(<a href={uri} />)).toBe(true);
    });
})
