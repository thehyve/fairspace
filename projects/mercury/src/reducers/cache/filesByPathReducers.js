import * as actionTypes from "../../actions/actionTypes";
import {getParentPath} from "../../utils/fileUtils";

const defaultState = {
    creatingDirectory: false
};

export const invalidateFiles = (state, ...paths) => {
    const newPathsState = paths.map(path => ({
        [path]: {
            pending: false,
            error: false,
            invalidated: true,
            data: [],
        }
    }));

    return Object.assign({}, state, ...newPathsState);
};

const filesByPath = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_FILES_PENDING:
            return {
                ...state,
                [action.meta.path]: {
                    pending: true,
                    error: false,
                    invalidated: false,
                    data: []
                }
            };
        case actionTypes.FETCH_FILES_FULFILLED: {
            const {meta: {path}, payload} = action;
            return {
                ...state,
                [path]: {
                    ...state[path],
                    pending: false,
                    error: false,
                    invalidated: false,
                    data: payload
                }
            };
        }
        case actionTypes.FETCH_FILES_REJECTED:
            return {
                ...state,
                [action.meta.path]: {
                    ...state[action.meta.path],
                    pending: false,
                    error: action.payload || true
                }
            };
        case actionTypes.CREATE_DIRECTORY_PENDING:
            return {
                ...state,
                creatingDirectory: true
            };
        case actionTypes.CREATE_DIRECTORY_FULFILLED:
        case actionTypes.INVALIDATE_CREATE_DIRECTORY: {
            const newState = {
                ...state,
                creatingDirectory: false
            };
            return invalidateFiles(newState, getParentPath(action.meta.path));
        }
        case actionTypes.CREATE_DIRECTORY_REJECTED:
            return {
                ...state,
                creatingDirectory: false
            };

        case actionTypes.DELETE_FILE_FULFILLED:
            return invalidateFiles(state, getParentPath(action.meta.path));
        case actionTypes.RENAME_FILE_FULFILLED:
        case actionTypes.INVALIDATE_FETCH_FILES:
        case actionTypes.UPLOAD_FILES_FULFILLED:
            return invalidateFiles(state, action.meta.path);
        case actionTypes.CLIPBOARD_PASTE_FULFILLED: {
            return invalidateFiles(state, action.meta.destinationDir, ...action.meta.filenames.map(getParentPath));
        }
        case actionTypes.DELETE_COLLECTION_PENDING:
            return invalidateFiles(state, `/${action.meta.location}`);
        default:
            return state;
    }
};

export default filesByPath;
