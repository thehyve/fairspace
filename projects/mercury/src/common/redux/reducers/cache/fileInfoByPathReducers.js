import * as actionTypes from '../../actions/actionTypes';
import {joinPaths} from "../../../utils/fileUtils";

export const invalidateFiles = (state, ...paths) => {
    // We should invalidate all keys that are equal to
    // or are descendants of any given path. This makes
    // sure that we invalidate for example subdirectories
    // of deleted directories as well.
    const keysToInvalidate = Object.keys(state)
        .filter(key => paths.find(
            path => (path === key) || key.startsWith(path + '/')
        ));

    const newPathsState = keysToInvalidate.map(path => ({
        [path]: {
            ...state[path],
            invalidated: true
        }
    }));

    return Object.assign({}, state, ...newPathsState);
};

export default (state = {}, action) => {
    switch (action.type) {
        case actionTypes.STAT_FILE_PENDING:
            return {
                ...state,
                [action.meta.path]: {pending: true}
            };
        case actionTypes.STAT_FILE_FULFILLED:
            return {
                ...state,
                [action.meta.path]: {data: action.payload}
            };
        case actionTypes.STAT_FILE_REJECTED:
            return {
                ...state,
                [action.meta.path]: {error: action.payload || true}
            };
        case actionTypes.RENAME_FILE_FULFILLED:
            return invalidateFiles(
                state,
                joinPaths(action.meta.path, action.meta.currentFilename),
                joinPaths(action.meta.path, action.meta.newFilename)
            );
        case actionTypes.DELETE_FILES_FULFILLED:
            return invalidateFiles(state, ...action.meta.paths);
        case actionTypes.CLIPBOARD_PASTE_FULFILLED:
            return invalidateFiles(
                state,
                ...action.meta.filenames
            );
        case actionTypes.UPDATE_COLLECTION_FULFILLED:
            return invalidateFiles(state, `/${action.meta.previousLocation}`);
        case actionTypes.DELETE_COLLECTION_FULFILLED:
            return invalidateFiles(state, `/${action.meta.location}`);
        default:
            return state;
    }
};

export const getFileInfoByPath = (state, path) => (state.cache.fileInfoByPath && state.cache.fileInfoByPath[path] && state.cache.fileInfoByPath[path].data) || {};

export const hasFileInfoErrorByPath = (state, path) => (state.cache.fileInfoByPath && state.cache.fileInfoByPath[path] && state.cache.fileInfoByPath[path].error);

export const isFileInfoByPathPending = (state, path) => (state.cache.fileInfoByPath && state.cache.fileInfoByPath[path] && state.cache.fileInfoByPath[path].pending);
