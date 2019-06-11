import React from 'react';
import {shallow} from 'enzyme';

import {SearchPage} from '../SearchPage';
import SearchResults from '../SearchResults';
import {MessageDisplay} from "../../common";

describe('<SearchPage />', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<SearchPage fetchVocabularyIfNeeded={() => {}} location={{search: ''}} performSearch={() => {}} />);
    });

    it('should render <SearchResults /> when receiving results', () => {
        expect(wrapper.find(SearchResults)).toHaveLength(1);
    });

    it('should render error component on error', () => {
        wrapper.setProps({
            error: {
                message: 'An error'
            }
        });
        expect(wrapper.find(MessageDisplay)).toHaveLength(1);
    });

    it('should perform search on component first mount', () => {
        const search = jest.fn();
        shallow(<SearchPage fetchVocabularyIfNeeded={() => {}} location={{search: ''}} performSearch={search} />);
        expect(search.mock.calls.length).toEqual(1);
    });

    it('should fetch vocabulary on component first mount', () => {
        const fetchVocabularyIfNeeded = jest.fn();
        shallow(<SearchPage fetchVocabularyIfNeeded={fetchVocabularyIfNeeded} location={{search: ''}} performSearch={() => {}} />);
        expect(fetchVocabularyIfNeeded.mock.calls.length).toEqual(1);
    });

    it('should perform search after search query change', () => {
        const localWrapper = shallow(<SearchPage fetchVocabularyIfNeeded={() => {}} location={{search: ''}} performSearch={() => {}} />);
        const search = jest.fn();
        localWrapper.setProps(
            {
                location: {search: 'A new Search'},
                performSearch: search
            }
        );
        expect(search.mock.calls.length).toEqual(1);
    });
});
