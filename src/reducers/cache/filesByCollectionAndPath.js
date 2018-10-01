const defaultState = {};

const filesByCollectionAndPath = (state = defaultState, action) => {
    let collectionId, path;
    switch (action.type) {
        case "FILES_PENDING":
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
            }
        case "FILES_FULFILLED":
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
            }
        case "FILES_REJECTED":
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
            }
        case "INVALIDATE_FILES":
        case "RENAME_FILE_FULFILLED":
        case "DELETE_FILE_FULFILLED":
        case "CREATE_DIRECTORY_FULFILLED":
        case "UPLOAD_FILES_FULFILLED":
            collectionId = action.meta.collection.id;
            path = action.meta.path;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [path]: {
                        ...state[collectionId][path],
                        invalidated: true
                    }
                }
            }
        case "CLIPBOARD_PASTE_FULFILLED":
            collectionId = action.meta.collection.id;
            const {sourceDir, destinationDir} = action.meta;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [sourceDir]: {
                        ...state[collectionId][sourceDir],
                        invalidated: true
                    },
                    [destinationDir]: {
                        ...state[collectionId][destinationDir],
                        invalidated: true
                    }
                }
            }
        default:
            return state;
    }
};

export default filesByCollectionAndPath;
