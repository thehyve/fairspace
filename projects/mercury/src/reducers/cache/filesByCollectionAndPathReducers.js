import * as actionTypes from "../../actions/actionTypes";

const defaultState = {
    creatingDirectory: false
};

export const invalidateFiles = (state, collectionId, ...paths) => {
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
    switch (action.type) {
        case actionTypes.FETCH_FILES_PENDING:
            collectionId = action.meta.collection.iri;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [action.meta.path]: {
                        pending: true,
                        error: false,
                        invalidated: false,
                        data: []
                    }
                }
            };
        case actionTypes.FETCH_FILES_FULFILLED:
            collectionId = action.meta.collection.iri;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [action.meta.path]: {
                        ...state[collectionId][action.meta.path],
                        pending: false,
                        data: action.payload
                    }
                }
            };
        case actionTypes.FETCH_FILES_REJECTED:
            collectionId = action.meta.collection.iri;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [action.meta.path]: {
                        ...state[collectionId][action.meta.path],
                        pending: false,
                        error: action.payload || true
                    }
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
            return invalidateFiles(newState, action.meta.collection.iri, action.meta.path);
        }
        case actionTypes.INVALIDATE_FETCH_FILES:
        case actionTypes.RENAME_FILE_FULFILLED:
        case actionTypes.DELETE_FILE_FULFILLED:
        case actionTypes.UPLOAD_FILES_FULFILLED:
            return invalidateFiles(state, action.meta.collection.iri, action.meta.path);
        case actionTypes.CLIPBOARD_PASTE_FULFILLED: {
            const {sourceDir, destinationDir} = action.meta;
            return invalidateFiles(state, action.meta.collection.iri, sourceDir, destinationDir);
        }
        default:
            return state;
    }
};

export default filesByCollectionAndPath;
