import {collectionsSearchReducer} from './searchReducers';
import * as actionTypes from "../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../utils/testUtils';

testNoChangedOnUnknownActionType('Search reducers', collectionsSearchReducer);

describe('Search reducers', () => {
    it('should return the initial state when no action is given', () => {
        const initialState = {
            pending: false,
            items: [],
            total: 0,
            error: null
        };
        expect(collectionsSearchReducer(undefined, {}))
            .toEqual(initialState);
    });

    it('should return proper pending value after firing pending action', () => {
        expect(
            collectionsSearchReducer(undefined, {
                type: actionTypes.COLLECTIONS_SEARCH_PENDING,
                meta: {searchType: 'collections'},
            })
        ).toEqual({
            pending: true,
            items: [],
            total: 0,
            error: null,
        });
    });

    it('should update results on search success', () => {
        const results = {items: ['item 1', 'item 2']};
        const action = {
            type: actionTypes.COLLECTIONS_SEARCH_FULFILLED,
            payload: results,
            meta: {searchType: 'collections'},
        };
        expect(collectionsSearchReducer(undefined, action).items).toContain('item 1');
    });
});
