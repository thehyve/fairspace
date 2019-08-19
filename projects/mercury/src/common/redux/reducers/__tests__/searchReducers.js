import {collectionsSearchReducer, destrctureSearchState} from '../searchReducers';
import * as actionTypes from '../../actions/actionTypes';
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Search reducers', collectionsSearchReducer);

describe('Search reducers', () => {
    it('should return the initial state when no action is given', () => {
        const initialState = {
            pending: false,
            data: {
                items: [],
                total: 0,
            },
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
            data: undefined,
            error: false,
        });
    });

    it('should update results on search success', () => {
        const results = {items: ['item 1', 'item 2']};
        const action = {
            type: actionTypes.COLLECTIONS_SEARCH_FULFILLED,
            payload: results,
            meta: {searchType: 'collections'},
        };
        expect(collectionsSearchReducer(undefined, action).data.items).toContain('item 1');
    });
});

describe('Search reducer helpers', () => {
    it('destrctureSearchState should destructure the state correclt', () => {
        const state = {
            pending: false,
            data: {
                total: 1,
                items: ["first", "second"]
            },
            error: false,
            invalidated: false
        };
        expect(destrctureSearchState(state)).toEqual({
            pending: false,
            total: 1,
            items: ["first", "second"],
            error: false,
            invalidated: false
        });
    });
});
