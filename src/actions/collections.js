import {createErrorHandlingPromiseAction} from "../utils/redux";
import CollectionAPI from "../services/CollectionAPI/CollectionAPI"

export const invalidateCollections = () => ({
    type: "INVALIDATE_COLLECTIONS"
})

export const fetchCollectionsIfNeeded = () => {
    return (dispatch, getState) => {
        if (shouldFetchCollections(getState())) {
            return dispatch(fetchCollections())
        } else {
            return Promise.resolve();
        }
    }
}

export const addCollection = (name, description) => ({
    type: "ADD_COLLECTION",
    payload: CollectionAPI.addCollection(name, description),
})

export const updateCollection = createErrorHandlingPromiseAction((id, name, description) => ({
    type: "UPDATE_COLLECTION",
    payload: CollectionAPI.updateCollection(id, name, description),
}))

export const deleteCollection = id => ({
    type: "DELETE_COLLECTION",
    payload: CollectionAPI.deleteCollection(id),
})

const shouldFetchCollections = (state) => {
    const collections = state && state.cache ? state.cache.collections : undefined;

    if (!collections) {
        return true
    } else if (collections.pending) {
        return false
    } else {
        return collections.invalidated
    }
}

const fetchCollections = createErrorHandlingPromiseAction(() => ({
    type: "COLLECTIONS",
    payload: CollectionAPI.getCollections()
}));

