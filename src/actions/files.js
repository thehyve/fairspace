import {createErrorHandlingPromiseAction} from "../utils/redux";
import FileAPIFactory from "../services/FileAPI/FileAPIFactory";

export const invalidateCollections = (collection, path) => ({
    type: "INVALIDATE_FILES",
    meta: {
        collection,
        path
    }
})

export const fetchFilesIfNeeded = (collection, path) => {
    return (dispatch, getState) => {
        if (shouldFetchFiles(getState(), collection, path)) {
            return dispatch(fetchFiles(collection, path))
        } else {
            return Promise.resolve();
        }
    }
}

const shouldFetchFiles = (state, collection, path) => {
    const filesPerCollection = state.cache.filesByCollectionAndPath[collection.id] || {};
    const files = filesPerCollection[path];

    if (!files) {
        return true
    } else if (files.pending) {
        return false
    } else {
        return files.invalidated
    }
}

const fetchFiles = createErrorHandlingPromiseAction((collection, path) => {
    console.log(collection);
    return {
        type: "FILES",
        payload: FileAPIFactory.build(collection).list(path),
        meta: {
            collection: collection,
            path: path
        }
    }
});

