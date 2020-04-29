import React from 'react';
import {TableBody, TableRow} from '@material-ui/core';
import {mount, shallow} from 'enzyme';
import {act} from 'react-dom/test-utils';
import MessageDisplay from '../../common/components/MessageDisplay';
import {SearchPage, SearchPageContainer} from '../SearchPage';

describe('<SearchPage />', () => {
    let wrapper;
    const historyMock = {push: jest.fn()};
    beforeEach(() => {
        wrapper = shallow(<SearchPage
            classes={{}}
            items={[{id: "http://id", label: "test", type: "metadata-type-1"}]}
            loading={false}
            history={historyMock}
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
                location={{search: ''}}
                query="theQuery"
                searchFunction={searchFunction}
            />);
        });

        expect(searchFunction).toHaveBeenCalledTimes(1);
        expect(searchFunction).toHaveBeenCalledWith(expect.objectContaining({query: 'theQuery'}));
    });

    it('should perform search after search query change', async () => {
        const searchFunction = jest.fn(() => Promise.resolve());

        await act(async () => {
            const localWrapper = mount(<SearchPageContainer
                classes={{}}
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

    it('should handle redirect to result page', () => {
        const tableRows = wrapper.find(TableBody).find(TableRow);
        expect(tableRows.length).toEqual(1);
        tableRows.first().prop("onDoubleClick")({id: 'http://id'});

        expect(historyMock.push).toHaveBeenCalledTimes(1);
        expect(historyMock.push).toHaveBeenCalledWith('/metadata?iri=http%3A%2F%2Fid');
    });
});
