import React from 'react';
import {shallow, mount} from 'enzyme';
import {act} from 'react-dom/test-utils';
import {MessageDisplay} from '@fairspace/shared-frontend';

import {SearchPage, SearchPageContainer} from '../SearchPage';

describe('<SearchPage />', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<SearchPage
            classes={{}}
            total={1}
            items={[]}
            loading={false}
        />);
    });

    it('should render table when receiving results', () => {
        expect(wrapper.find('[data-testid="results-table"]')).toHaveLength(1);
    });

    it('should render error component on error', () => {
        wrapper.setProps({
            error: {
                message: 'An error'
            }
        });
        expect(wrapper.find(MessageDisplay)).toHaveLength(1);
    });

    it('should perform search on component first mount', async () => {
        const searchFunction = jest.fn(() => Promise.resolve());

        await act(async () => {
            mount(<SearchPageContainer
                classes={{}}
                fetchVocabularyIfNeeded={() => {}}
                location={{search: ''}}
                query="theQuery"
                searchFunction={searchFunction}
            />);
        });

        expect(searchFunction).toHaveBeenCalledTimes(1);
        expect(searchFunction).toHaveBeenCalledWith(expect.objectContaining({query: 'theQuery'}));
    });

    it('should fetch vocabulary on component first mount', async () => {
        const fetchVocabularyIfNeeded = jest.fn();

        await act(async () => {
            mount(<SearchPageContainer
                classes={{}}
                fetchVocabularyIfNeeded={fetchVocabularyIfNeeded}
                location={{search: ''}}
                searchFunction={() => Promise.resolve()}
            />);
        });

        expect(fetchVocabularyIfNeeded).toHaveBeenCalledTimes(1);
    });

    it('should perform search after search query change', async () => {
        const searchFunction = jest.fn(() => Promise.resolve());

        await act(async () => {
            const localWrapper = mount(<SearchPageContainer
                classes={{}}
                fetchVocabularyIfNeeded={() => {}}
                location={{search: ''}}
                searchFunction={() => Promise.resolve()}
            />);

            localWrapper.setProps(
                {
                    location: {search: 'A new Search'},
                    searchFunction
                }
            );
        });

        expect(searchFunction).toHaveBeenCalledTimes(1);
    });
});
