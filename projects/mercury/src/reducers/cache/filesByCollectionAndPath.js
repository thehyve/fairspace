import {
    CLIPBOARD_PASTE,
    CREATE_DIRECTORY,
    DELETE_FILE,
    FILES,
    RENAME_FILE,
    UPLOAD_FILES
} from "../../actions/actionTypes";
import * as actionTypes from "../../utils/redux-action-types";

const defaultState = {
    creatingDirectory: false
};

const invalidateFiles = (state, collectionId, ...paths) => {
    const newPathsState = paths.map(path => ({
        [path]: {
            ...state[collectionId][path],
            invalidated: true
        }
    }));

    return {
        ...state,
        [collectionId]: Object.assign({}, state[collectionId], ...newPathsState)
    };
};

const filesByCollectionAndPath = (state = defaultState, action) => {
    let collectionId;
    let path;
    switch (action.type) {
        case actionTypes.pending(FILES):
            collectionId = action.meta.collection.id;
            path = action.meta.path;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [path]: {
                        pending: true,
                        error: false,
                        invalidated: false,
                        data: {}
                    }
                }
            };
        case actionTypes.fulfilled(FILES):
            collectionId = action.meta.collection.id;
            path = action.meta.path;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [path]: {
                        ...state[collectionId][path],
                        pending: false,
                        data: action.payload
                    }
                }
            };
        case actionTypes.rejected(FILES):
            collectionId = action.meta.collection.id;
            path = action.meta.path;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [path]: {
                        ...state[collectionId][path],
                        pending: false,
                        error: action.payload || true
                    }
                }
            };
        case actionTypes.pending(CREATE_DIRECTORY):
            return {
                ...state,
                creatingDirectory: true
            };
        case actionTypes.fulfilled(CREATE_DIRECTORY):
        case actionTypes.rejected(CREATE_DIRECTORY):
        case actionTypes.invalidate(CREATE_DIRECTORY): {
            const newState = {
                ...state,
                creatingDirectory: false
            };
            return invalidateFiles(newState, action.meta.collection.id, action.meta.path);
        }
        case actionTypes.invalidate(FILES):
        case actionTypes.fulfilled(RENAME_FILE):
        case actionTypes.fulfilled(DELETE_FILE):
        case actionTypes.fulfilled(UPLOAD_FILES):
            return invalidateFiles(state, action.meta.collection.id, action.meta.path);
        case actionTypes.fulfilled(CLIPBOARD_PASTE): {
            const {sourceDir, destinationDir} = action.meta;
            return invalidateFiles(state, action.meta.collection.id, sourceDir, destinationDir);
        }
        default:
            return state;
    }
};

export default filesByCollectionAndPath;
