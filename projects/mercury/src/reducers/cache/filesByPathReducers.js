import * as actionTypes from "../../actions/actionTypes";
import {parentPath} from "../../utils/fileUtils";

const defaultState = {
    creatingDirectory: false
};

function invalidateFiles(state, ...paths) {
    const newPathsState = paths.map(path => ({
        [path]: {
            invalidated: true
        }
    }));

    return Object.assign({}, state, ...newPathsState)
}

function filesByPath(state = defaultState, action) {
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
        case actionTypes.FETCH_FILES_FULFILLED:
            return {
                ...state,
                    [action.meta.path]: {
                        ...state[action.meta.path],
                        pending: false,
                        data: action.payload
                    }
            };
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
        case actionTypes.CREATE_DIRECTORY_REJECTED:
        case actionTypes.INVALIDATE_CREATE_DIRECTORY: {
            const newState = {
                ...state,
                creatingDirectory: false
            };
            return invalidateFiles(newState, parentPath(action.meta.path));
        }


        case actionTypes.DELETE_FILE_FULFILLED:
            return invalidateFiles(state, parentPath(action.meta.path));
        case actionTypes.RENAME_FILE_FULFILLED:
        case actionTypes.INVALIDATE_FETCH_FILES:
        case actionTypes.UPLOAD_FILES_FULFILLED:
            return invalidateFiles(state, action.meta.path);
        case actionTypes.CLIPBOARD_PASTE_FULFILLED: {
            return invalidateFiles(state, action.meta.destinationDir, ...action.meta.filenames.map(parentPath));
        }
        default:
            return state;
    }
}

export default filesByPath;
