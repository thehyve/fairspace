import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import CollectionAPI from "../services/CollectionAPI/CollectionAPI";
import {
    ADD_COLLECTION, COLLECTIONS, DELETE_COLLECTION, UPDATE_COLLECTION
} from "./actionTypes";
import * as actionTypes from "../utils/redux-action-types";

export const invalidateCollections = () => ({
    type: actionTypes.invalidate(COLLECTIONS)
});

const fetchCollections = createErrorHandlingPromiseAction(() => ({
    type: COLLECTIONS,
    payload: CollectionAPI.getCollections()
}));

export const fetchCollectionsIfNeeded = () => dispatchIfNeeded(
    fetchCollections,
    state => (state && state.cache ? state.cache.collections : undefined)
);

export const addCollection = (name, description, type) => ({
    type: ADD_COLLECTION,
    payload: CollectionAPI.addCollection(name, description, type),
});

export const updateCollection = createErrorHandlingPromiseAction((id, name, description) => ({
    type: UPDATE_COLLECTION,
    payload: CollectionAPI.updateCollection(id, name, description),
    meta: {
        id, name, description
    }
}));

export const deleteCollection = id => ({
    type: DELETE_COLLECTION,
    payload: CollectionAPI.deleteCollection(id),
});
