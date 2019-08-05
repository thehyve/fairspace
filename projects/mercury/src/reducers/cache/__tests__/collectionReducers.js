import reducer from '../collectionReducers';
import * as actionTypes from "../../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Collections reducers', reducer);

describe('Collections reducers', () => {
    it('should return the same state with invalidated true after adding a collection', () => {
        const expectedState = {
            data: [],
            invalidated: true,
        };
        expect(reducer(undefined, {type: actionTypes.ADD_COLLECTION_FULFILLED})).toEqual(expectedState);
    });

    it('should return the same state with invalidated true after deleting a collection', () => {
        const expectedState = {
            data: [],
            invalidated: true,
        };
        expect(reducer(undefined, {type: actionTypes.DELETE_COLLECTION_FULFILLED})).toEqual(expectedState);
    });

    it('should modify collections properly on update', () => {
        const state = {
            data: [{
                location: "Jan_Smit_s_collection-500",
                name: "Jan Smit's collection 1",
                description: "Jan Smit's collection, beyond the horizon 01",
                iri: "https://workspace.ci.test.fairdev.app/iri/500",
                access: "Manage",
                type: "LOCAL_STORAGE",
                dateCreated: "2018-09-19T15:48:23.016165Z",
                createdBy: "user4-id",
            }]
        };

        expect(reducer(state, {
            type: actionTypes.UPDATE_COLLECTION_FULFILLED,
            meta: {
                id: 'https://workspace.ci.test.fairdev.app/iri/500',
                name: 'new name',
                description: 'new description'
            }
        })).toEqual({
            data: [],
            invalidated: true,
        });
    });
});
