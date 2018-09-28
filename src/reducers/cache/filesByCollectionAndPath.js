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
                        items: {}
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
                        items: action.payload
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
            collectionId = action.meta.collection.id;
            path = action.meta.path;
            return {
                ...state,
                [collectionId]: {
                    ...state[collectionId],
                    [path]: {
                        ...state[collectionId][path],
                        invalidated: false
                    }
                }
            }
        default:
            return state;
    }
};

export default filesByCollectionAndPath;
