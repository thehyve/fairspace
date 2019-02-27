import reducer, {invalidateFiles} from './filesByPathReducers';
import * as actionTypes from "../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Files by collection and path reducers', reducer);

describe('Files by collection and path reducers', () => {
    it('should invalidate files and directories', () => {
        const statePre = {
            "creatingDirectory": false,
            "/coll/dir/subdir": {
                pending: false,
                error: false,
                invalidated: false,
                data: []
            }
        };

        const stateAfterInvalidation = invalidateFiles(statePre, '/coll/dir/subdir');

        const expectedState = {
            "creatingDirectory": false,

            "/coll/dir/subdir": {
                invalidated: true,
                data: [],
                error: false,
                pending: false
            }

        };

        expect(stateAfterInvalidation).toEqual(expectedState);
    });

    it('should mark each path as pending', () => {
        const state = {
            "creatingDirectory": false,
            "/coll/dir/file": {
                pending: false,
                error: false,
                invalidated: false,
                data: []
            }
        };

        const action = {
            type: actionTypes.FETCH_FILES_PENDING,
            meta: {
                path: "/coll/dir/file"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "/coll/dir/file": {
                pending: true,
                error: false,
                invalidated: false,
                data: []
            }
        };

        expect(reducer(state, action)).toEqual(expectedState);
    });

    it('should mark each path as pending (empty state)', () => {
        const action = {
            type: actionTypes.FETCH_FILES_PENDING,
            meta: {
                path: "/Jan_Smit_s_collection-500"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "/Jan_Smit_s_collection-500": {
                pending: true,
                error: false,
                invalidated: false,
                data: []
            }
        };

        expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should append files to collection (empty state)', () => {
        const action = {
            type: actionTypes.FETCH_FILES_FULFILLED,
            payload: [
                {
                    filename: "/Jan_Smit_s_collection-500/dir1",
                    basename: "dir1",
                    lastmod: "Tue, 26 Feb 2019 09:12:53 GMT",
                    size: 0,
                    type: "directory",
                    etag: "62831cd6fa9d1b0c4d3d2948f4e9881e"
                }
            ],
            meta: {
                path: "/Jan_Smit_s_collection-500"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "/Jan_Smit_s_collection-500": {
                pending: false,
                error: false,
                invalidated: false,
                data: [
                    {
                        filename: "/Jan_Smit_s_collection-500/dir1",
                        basename: "dir1",
                        lastmod: "Tue, 26 Feb 2019 09:12:53 GMT",
                        size: 0,
                        type: "directory",
                        etag: "62831cd6fa9d1b0c4d3d2948f4e9881e"
                    }
                ]
            }

        };

        expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should append files to collection (empty state)', () => {
        const action = {
            type: actionTypes.FETCH_FILES_FULFILLED,
            payload: [
                {
                    filename: "/Jan_Smit_s_collection-500/dir1",
                    basename: "dir1",
                    lastmod: "Tue, 26 Feb 2019 09:12:53 GMT",
                    size: 0,
                    type: "directory",
                    etag: "62831cd6fa9d1b0c4d3d2948f4e9881e"
                }
            ],
            meta: {
                path: "/Jan_Smit_s_collection-500"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "/Jan_Smit_s_collection-500": {
                pending: false,
                error: false,
                invalidated: false,
                data: [
                    {
                        filename: "/Jan_Smit_s_collection-500/dir1",
                        basename: "dir1",
                        lastmod: "Tue, 26 Feb 2019 09:12:53 GMT",
                        size: 0,
                        type: "directory",
                        etag: "62831cd6fa9d1b0c4d3d2948f4e9881e"
                    }
                ]
            }
        };

        expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should append files to collection', () => {
        const state = {
            "creatingDirectory": false,

            "/Jan_Smit_s_collection-500": {
                pending: true,
                error: false,
                invalidated: false,
                data: []
            }

        };
        const action = {
            type: actionTypes.FETCH_FILES_FULFILLED,
            payload: [
                {
                    filename: "/Jan_Smit_s_collection-500/dir1",
                    basename: "dir1",
                    lastmod: "Tue, 26 Feb 2019 09:12:53 GMT",
                    size: 0,
                    type: "directory",
                    etag: "62831cd6fa9d1b0c4d3d2948f4e9881e"
                }
            ],
            meta: {
                path: "/Jan_Smit_s_collection-500"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "/Jan_Smit_s_collection-500": {
                pending: false,
                error: false,
                invalidated: false,
                data: [
                    {
                        filename: "/Jan_Smit_s_collection-500/dir1",
                        basename: "dir1",
                        lastmod: "Tue, 26 Feb 2019 09:12:53 GMT",
                        size: 0,
                        type: "directory",
                        etag: "62831cd6fa9d1b0c4d3d2948f4e9881e"
                    }
                ]
            }
        };

        expect(reducer(state, action)).toEqual(expectedState);
    });

    it('should handle error properly', () => {
        const state = {
            "creatingDirectory": false,

            "/coll/dir": {
                pending: true,
                error: false,
                invalidated: false,
                data: []
            }
        };
        const action = {
            type: actionTypes.FETCH_FILES_REJECTED,
            payload: {message: 'an error'},
            meta: {
                path: "/coll/dir/sub-dir"
            },
            error: true
        };

        const expectedState = {
            "creatingDirectory": false,
            "/coll/dir": {
                pending: true,
                error: false,
                invalidated: false,
                data: []
            },
            "/coll/dir/sub-dir": {
                pending: false,
                error: {message: 'an error'}
            }
        };

        expect(reducer(state, action)).toEqual(expectedState);
    });

    it('should handle error properly (empty state)', () => {
        const action = {
            type: actionTypes.FETCH_FILES_REJECTED,
            payload: {message: 'an error'},
            meta: {
                path: "/coll/dir/sub-dir"
            },
            error: true
        };

        const expectedState = {
            "creatingDirectory": false,

            "/coll/dir/sub-dir": {
                error: {message: 'an error'},
                pending: false
            }
        };

        expect(reducer(undefined, action)).toEqual(expectedState);
    });
});
