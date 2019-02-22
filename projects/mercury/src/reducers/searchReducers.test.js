import reducer from './searchReducers';
import * as actionTypes from "../actions/actionTypes";

describe('Search reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });

    it('should return the initial state when no action is given', () => {
        const initialState = {
            pending: false,
            searchType: null,
            results: [],
            error: null,
        };
        expect(reducer(undefined, {}))
            .toEqual(initialState);
    });

    it('should return proper pending value after firing pending action', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.PERFORM_SEARCH_PENDING,
                meta: {searchType: 'collections'},
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
                payload: results,
                meta: {searchType: 'collections'},
            }).results
        ).toContain('item 1');
    });
});
