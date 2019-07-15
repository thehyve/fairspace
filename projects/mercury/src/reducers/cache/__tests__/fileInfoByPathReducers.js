import reducer from '../fileInfoByPathReducers';
import * as actionTypes from "../../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../../utils/testUtils';

testNoChangedOnUnknownActionType('Subject by path reducers', reducer);

describe('Subject by path reducers', () => {
    it('should set pending state for path on pending action', () => {
        expect(reducer({}, {
            type: actionTypes.STAT_FILE_PENDING,
            meta: {
                path: '/dir'
            },
        })).toEqual({
            "/dir": {
                pending: true
            }
        });
    });

    it('should update state with correct uri for path', () => {
        expect(reducer({}, {
            type: actionTypes.STAT_FILE_FULFILLED,
            payload: {
                props: {
                    iri: 'https://workspace.ci.test.fairdev.app/iri/500'
                }
            },
            meta: {
                path: '/dir'
            },
        })).toEqual({
            "/dir": {
                data: {
                    props: {
                        iri: "https://workspace.ci.test.fairdev.app/iri/500"
                    }
                }
            }
        });
    });

    describe('invalidation', () => {
        const filePath = "/coll/dir/file.txt";

        const state = {
            [filePath]: {
                pending: false,
                error: false,
                invalidated: false,
                data: []
            }
        };

        it('should invalidate files when renaming them', () => {
            const action = {
                type: actionTypes.RENAME_FILE_FULFILLED,
                meta: {
                    path: '/coll/dir',
                    currentFilename: 'file.txt',
                    newFilename: 'test.txt'
                }
            };
            expect(reducer(state, action)[filePath].invalidated).toBe(true);
        });

        it('should invalidate files when deleting them', () => {
            const action = {
                type: actionTypes.DELETE_FILES_FULFILLED,
                meta: {
                    paths: ['/coll/dir/file.txt']
                }
            };
            expect(reducer(state, action)[filePath].invalidated).toBe(true);
        });

        it('should invalidate files when pasting them somewhere else', () => {
            const action = {
                type: actionTypes.CLIPBOARD_PASTE_FULFILLED,
                meta: {
                    filenames: ['/coll/dir/file.txt']
                }
            };
            expect(reducer(state, action)[filePath].invalidated).toBe(true);
        });

        it('should invalidate file entries that do not exist yet', () => {
            const action = {
                type: actionTypes.DELETE_FILES_FULFILLED,
                meta: {
                    paths: ['/coll/dir/file.txt']
                }
            };
            expect(reducer({}, action)[filePath].invalidated).toBe(true);
        });
    });
});
