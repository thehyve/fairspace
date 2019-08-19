import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../../utils/redux";
import CollectionAPI from "../../../collections/CollectionAPI";
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

export const addCollection = (name, description, connectionString, location) => ({
    type: actionTypes.ADD_COLLECTION,
    payload: CollectionAPI.addCollection(name, description, connectionString, location),
});

export const updateCollection = (id, name, description, location, previousLocation) => ({
    type: actionTypes.UPDATE_COLLECTION,
    payload: CollectionAPI.updateCollection(id, name, description, location),
    meta: {
        id, name, description, location, previousLocation
    }
});

export const deleteCollection = (iri, location) => ({
    type: actionTypes.DELETE_COLLECTION,
    payload: CollectionAPI.deleteCollection(iri),
    meta: {
        location
    }
});
