import React from 'react';
import {shallow} from 'enzyme';

import {SearchPage} from './SearchPage';
import SearchResults from './SearchResults';
import {ErrorMessage} from "../common";

describe('<SearchPage />', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<SearchPage location={{search: ''}} performSearch={() => {}} />);
    });

    it('should render <SearchResults /> when receiving results', () => {
        expect(wrapper.find(SearchResults)).toHaveLength(1);
    });

    it('should render <ErrorMessage /> on error', () => {
        wrapper.setProps({error: 'An error'});
        expect(wrapper.find(ErrorMessage)).toHaveLength(1);
    });

    it('should perform search on component first mount', () => {
        const search = jest.fn();
        wrapper = shallow(<SearchPage location={{search: ''}} performSearch={search} />);
        expect(search.mock.calls.length).toEqual(1);
    });

    it('should perform search after search query change', () => {
        wrapper = shallow(<SearchPage location={{search: ''}} performSearch={() => {}} />);
        const search = jest.fn();
        wrapper.setProps(
            {
                location: {search: 'A new Search'},
                performSearch: search
            }
        );
        expect(search.mock.calls.length).toEqual(1);
    });
});
