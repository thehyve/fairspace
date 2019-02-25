import reducer from './collectionBrowserReducers';
import * as actionTypes from "../actions/actionTypes";

describe('Collection browser reducers', () => {
    it('should return the same state unchanged if action type is unknown by reducer', () => {
        const state = {'say what?': 'you can not touch this'};
        expect(reducer(state, {
            type: 'ACTION_THAT_DOES_NOT_EXIST'
        })).toEqual({'say what?': 'you can not touch this'});
    });

    it('should return the selected collection', () => {
        expect(
            reducer(
                undefined, {
                    type: actionTypes.SELECT_COLLECTION,
                    collectionId: 'some-kind-of-id'
                }
            )
        ).toEqual({
            selectedPaths: [],
            openedCollectionId: null,
            openedPath: null,
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionIRI: 'some-kind-of-id'
        });
    });

    it('should add path to selected when no paths selected', () => {
        expect(
            reducer(
                undefined, {
                    type: actionTypes.SELECT_PATH,
                    path: '/some_collection/dir1'
                }
            )
        ).toEqual({
            selectedPaths: ['/some_collection/dir1'],
            openedCollectionId: null,
            openedPath: null,
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionIRI: null
        });
    });

    it('should add path to selected paths', () => {
        const state = {selectedPaths: ['/some_collection/dir1']};
        expect(
            reducer(state, {
                type: actionTypes.SELECT_PATH,
                path: '/some_collection/dir2'
            })
        ).toEqual({
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2']
        });
    });

    it('should return empty selected paths when deselection is made for empty selected paths', () => {
        expect(
            reducer(undefined, {
                type: actionTypes.DESELECT_PATH,
                path: '/some_collection/dir1'
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: []
        });
    });

    it('should deselects a path correctly', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(
            reducer(state, {
                type: actionTypes.DESELECT_PATH,
                path: '/some_collection/dir1'
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: ['/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        });
    });

    it('should deselects a path correctly after deleting a file', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(
            reducer(state, {
                type: actionTypes.DELETE_FILE_FULFILLED,
                meta: {
                    fullpath: '/some_collection/dir1'
                }
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: ['/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        });
    });

    it('should deselects a collection on after successful deletion', () => {
        const state = {
            addingCollection: false,
            deletingCollection: true,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: 'some-kind-of-id',
            selectedPaths: []
        };

        expect(
            reducer(state, {
                type: actionTypes.DELETE_COLLECTION_FULFILLED,
                collectionId: 'some-kind-of-id'
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: []
        });
    });

    it('should return the opened path on open path action', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: null,
            selectedCollectionIRI: null,
            selectedPaths: []
        };

        expect(
            reducer(state, {
                type: actionTypes.OPEN_PATH,
                path: 'a/given/path'
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            openedCollectionId: null,
            openedPath: 'a/given/path',
            selectedCollectionIRI: null,
            selectedPaths: []
        });
    });
});
