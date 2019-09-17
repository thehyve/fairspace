import React from 'react';
import {shallow, mount} from 'enzyme';
import {MessageDisplay} from '@fairspace/shared-frontend';

import {SearchPage} from '../SearchPage';
import SearchResults from '../SearchResults';

describe('<SearchPage />', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<SearchPage
            results={{total: 1, items: []}}
            fetchVocabularyIfNeeded={() => {}}
            location={{search: ''}}
            performSearch={() => {}}
        />);
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
        mount(<SearchPage fetchVocabularyIfNeeded={() => {}} location={{search: ''}} performSearch={search} />);
        expect(search.mock.calls.length).toEqual(1);
    });

    it('should fetch vocabulary on component first mount', () => {
        const fetchVocabularyIfNeeded = jest.fn();
        mount(<SearchPage fetchVocabularyIfNeeded={fetchVocabularyIfNeeded} location={{search: ''}} performSearch={() => {}} />);
        expect(fetchVocabularyIfNeeded.mock.calls.length).toEqual(1);
    });

    it('should perform search after search query change', () => {
        const localWrapper = mount(<SearchPage fetchVocabularyIfNeeded={() => {}} location={{search: ''}} performSearch={() => {}} />);
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
