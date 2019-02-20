import reducer from './searchReducers';
import * as actionTypes from "../actions/actionTypes";

describe('Search reducers', () => {
    const initialState = {
        pending: false,
        searchType: null,
        results: [],
        error: null,
    };

    it('should return the initial state when no action is given', () => {
        expect(reducer(undefined, {}))
            .toEqual(initialState);
    });

    it('should return proper pending value after firing pending action', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.PERFORM_SEARCH_PENDING,
                searchType: 'collections',
            })
        ).toEqual({
            pending: true,
            searchType: 'collections',
            results: [],
            error: null,
        });
    });

    it('should update results on search success', () => {
        const results = ['item 1', 'item 2'];

        expect(
            reducer(undefined, {
                type: actionTypes.PERFORM_SEARCH_FULFILLED,
                searchType: 'collections',
                payload: results
            }).results
        ).toContain('item 1');
    });
});
