import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import CollectionAPI from "../services/CollectionAPI";
import * as actionTypes from "./actionTypes";

export const invalidateCollections = () => ({
    type: actionTypes.INVALIDATE_FETCH_COLLECTIONS
});

const fetchCollections = createErrorHandlingPromiseAction(() => ({
    type: actionTypes.FETCH_COLLECTIONS,
    payload: CollectionAPI.getCollections()
}));

export const fetchCollectionsIfNeeded = () => dispatchIfNeeded(
    fetchCollections,
    state => (state && state.cache ? state.cache.collections : undefined)
);

export const addCollection = (name, description, type, location) => ({
    type: actionTypes.ADD_COLLECTION,
    payload: CollectionAPI.addCollection(name, description, type, location),
});

export const updateCollection = createErrorHandlingPromiseAction((id, name, description, location) => ({
    type: actionTypes.UPDATE_COLLECTION,
    payload: CollectionAPI.updateCollection(id, name, description, location),
    meta: {
        id, name, description
    }
}));

export const deleteCollection = id => ({
    type: actionTypes.DELETE_COLLECTION,
    payload: CollectionAPI.deleteCollection(id),
});
