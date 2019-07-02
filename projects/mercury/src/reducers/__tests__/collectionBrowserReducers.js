import reducer from '../collectionBrowserReducers';
import * as actionTypes from "../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Collection browser reducers', reducer);

describe('Collection browser reducers', () => {
    it('should return the selected collection', () => {
        expect(
            reducer(
                undefined, {
                    type: actionTypes.SELECT_COLLECTION,
                    location: 'col1'
                }
            )
        ).toEqual({
            selectedPaths: [],
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: 'col1'
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
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null
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
            selectedCollectionLocation: null,
            selectedPaths: []
        });
    });

    it('should deselects a path correctly', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null,
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
            selectedCollectionLocation: null,
            selectedPaths: ['/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        });
    });

    it('should deselects a path correctly after deleting a file', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null,
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(
            reducer(state, {
                type: actionTypes.DELETE_FILE_FULFILLED,
                meta: {
                    path: '/some_collection/dir1'
                }
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null,
            selectedPaths: ['/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        });
    });

    it('should deselect all paths after deleting multiple files', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null,
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(
            reducer(state, {
                type: actionTypes.DELETE_FILES_FULFILLED,
                meta: {
                    paths: ['/some_collection/dir1']
                }
            })
        ).toEqual({
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null,
            selectedPaths: []
        });
    });


    it('should deselects a collection on after successful deletion', () => {
        const state = {
            addingCollection: false,
            deletingCollection: true,
            selectedCollectionLocation: 'some-kind-of-id',
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
            selectedCollectionLocation: null,
            selectedPaths: []
        });
    });

    it('should reset selected paths after file rename success', () => {
        const state = {
            addingCollection: false,
            deletingCollection: false,
            selectedCollectionLocation: null,
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(reducer(state, {type: actionTypes.RENAME_FILE_FULFILLED}))
            .toEqual({
                addingCollection: false,
                deletingCollection: false,
                selectedCollectionLocation: null,
                selectedPaths: []
            });
    });

    it('should reset selected paths after file rename success (empty state)', () => {
        expect(reducer(undefined, {type: actionTypes.RENAME_FILE_FULFILLED}))
            .toEqual({
                addingCollection: false,
                deletingCollection: false,
                selectedCollectionLocation: null,
                selectedPaths: []
            });
    });

    it('should set selected paths correctly', () => {
        const state = {
            selectedPaths: ['/some_collection/something']
        };

        const action = {
            type: actionTypes.SET_SELECTED_PATHS,
            paths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(reducer(state, action))
            .toEqual({
                selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
            });
    });

    it('should set selected paths correctly (no paths selected prior)', () => {
        const state = {
            selectedPaths: []
        };
        const action = {
            type: actionTypes.SET_SELECTED_PATHS,
            paths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };

        expect(reducer(state, action))
            .toEqual({
                selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
            });
    });

    it('should deselect all paths correctly', () => {
        const state = {
            selectedPaths: ['/some_collection/dir1', '/some_collection/dir2', '/some_collection/dir3', '/some_collection/dir4']
        };
        const action = {type: actionTypes.DESELECT_ALL_PATHS};

        expect(reducer(state, action))
            .toEqual({
                selectedPaths: []
            });
    });

    it('should deselect all paths correctly (empty selected paths already)', () => {
        const state = {
            selectedPaths: []
        };
        const action = {type: actionTypes.DESELECT_ALL_PATHS};

        expect(reducer(state, action))
            .toEqual({
                selectedPaths: []
            });
    });
});
