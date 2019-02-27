import reducer, {invalidateFiles} from './filesByPathReducers';
import * as actionTypes from "../../actions/actionTypes";
import {testNoChangedOnUnknownActionType} from '../../utils/testUtils';

testNoChangedOnUnknownActionType('Files by collection and path reducers', reducer);

describe('Files by collection and path reducers', () => {
    it('should invalidate files and directories', () => {
        const statePre = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: false,
                    data: []
                }
            }
        };

        const stateAfterInvalidation = invalidateFiles(statePre, 'https://workspace.ci.test.fairdev.app/iri/500', '/');

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: true,
                    data: []
                }
            }
        };

        expect(stateAfterInvalidation).toEqual(expectedState);
    });

    it('should mark each path as pending', () => {
        const state = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: false,
                    error: false,
                    invalidated: false,
                    data: []
                }
            }
        };

        const action = {
            type: actionTypes.FETCH_FILES_PENDING,
            meta: {
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: true,
                    error: false,
                    invalidated: false,
                    data: []
                }
            }
        };

        expect(reducer(state, action)).toEqual(expectedState);
    });

    it('should mark each path as pending (empty state)', () => {
        const action = {
            type: actionTypes.FETCH_FILES_PENDING,
            meta: {
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: true,
                    error: false,
                    invalidated: false,
                    data: []
                }
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
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
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
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
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
            }
        };

        expect(reducer(undefined, action)).toEqual(expectedState);
    });

    it('should append files to collection', () => {
        const state = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: true,
                    error: false,
                    invalidated: false,
                    data: []
                }
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
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/"
            }
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
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
            }
        };

        expect(reducer(state, action)).toEqual(expectedState);
    });

    it('should handle error properly', () => {
        const state = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: true,
                    error: false,
                    invalidated: false,
                    data: []
                }
            }
        };
        const action = {
            type: actionTypes.FETCH_FILES_REJECTED,
            payload: {message: 'an error'},
            meta: {
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/sub-dir"
            },
            error: true
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/": {
                    pending: true,
                    error: false,
                    invalidated: false,
                    data: []
                },
                "/sub-dir": {
                    pending: false,
                    error: {message: 'an error'},
                    invalidated: true,
                    data: []
                }
            }
        };

        expect(reducer(state, action)).toEqual(expectedState);
    });

    it('should handle error properly (empty state)', () => {
        const action = {
            type: actionTypes.FETCH_FILES_REJECTED,
            payload: {message: 'an error'},
            meta: {
                collection: {
                    location: "Jan_Smit_s_collection-500",
                    name: "Jan Smit's collection 1",
                    description: "Jan Smit's collection, beyond the horizon 01",
                    iri: "https://workspace.ci.test.fairdev.app/iri/500",
                    access: "Manage",
                    type: "LOCAL_STORAGE",
                    dateCreated: "2018-09-19T15:48:23.016165Z",
                    creator: "user4-id"
                },
                path: "/sub-dir"
            },
            error: true
        };

        const expectedState = {
            "creatingDirectory": false,
            "https://workspace.ci.test.fairdev.app/iri/500": {
                "/sub-dir": {
                    pending: false,
                    error: {message: 'an error'},
                    invalidated: true,
                    data: []
                }
            }
        };

        expect(reducer(undefined, action)).toEqual(expectedState);
    });
});
