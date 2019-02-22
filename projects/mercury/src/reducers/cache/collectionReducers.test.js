import reducer from './collectionReducers';
import * as actionTypes from "../../actions/actionTypes";

describe('Collections reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });

    it('should return the same state with invalidated true when adding or deleting a collection', () => {
        const expectedState = {
            data: [],
            invalidated: true,
        };
        expect(reducer(undefined, {type: actionTypes.ADD_COLLECTION_FULFILLED})).toEqual(expectedState);
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
                creator: "user4-id",
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
            data: [{
                location: "Jan_Smit_s_collection-500",
                name: "new name",
                description: "new description",
                iri: "https://workspace.ci.test.fairdev.app/iri/500",
                access: "Manage",
                type: "LOCAL_STORAGE",
                dateCreated: "2018-09-19T15:48:23.016165Z",
                creator: "user4-id",
            }],
            invalidated: true,
        });
    });

    it('should not modify state on update if collection id is not found', () => {
        const state = {
            data: [{
                location: "Jan_Smit_s_collection-500",
                name: "Jan Smit's collection 1",
                description: "Jan Smit's collection, beyond the horizon 01",
                iri: "https://workspace.ci.test.fairdev.app/iri/500",
                access: "Manage",
                type: "LOCAL_STORAGE",
                dateCreated: "2018-09-19T15:48:23.016165Z",
                creator: "user4-id",
            }]
        };

        expect(reducer(state, {
            type: actionTypes.UPDATE_COLLECTION_FULFILLED,
            meta: {
                id: '',
                name: 'new name',
                description: 'new description'
            }
        })).toEqual({
            data: [{
                location: "Jan_Smit_s_collection-500",
                name: "Jan Smit's collection 1",
                description: "Jan Smit's collection, beyond the horizon 01",
                iri: "https://workspace.ci.test.fairdev.app/iri/500",
                access: "Manage",
                type: "LOCAL_STORAGE",
                dateCreated: "2018-09-19T15:48:23.016165Z",
                creator: "user4-id",
            }]
        });
    });
});
