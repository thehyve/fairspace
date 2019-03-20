import PermissionAPI from '../services/PermissionAPI';
import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {ALTER_PERMISSION, FETCH_PERMISSIONS} from "./actionTypes";

export const fetchPermissions = createErrorHandlingPromiseAction((iri, useCache = true) => ({
    type: FETCH_PERMISSIONS,
    payload: PermissionAPI.getPermissions(iri, useCache),
    meta: {
        iri
    }
}));

/**
 * Method to retrieve permissions from the backend when the data is not available or invalidated
 * Please note that by default it does not use the browser cache (i.e. explicitly reloading from the backend)
 *
 * @param collectionId
 * @param useCache
 * @returns {Function}
 */
export const fetchPermissionsIfNeeded = (collectionId, useCache = false) => dispatchIfNeeded(
    () => fetchPermissions(collectionId, useCache),
    state => (state && state.cache && state.cache.permissionsByCollection ? state.cache.permissionsByCollection[collectionId] : undefined)
);

export const alterPermission = createErrorHandlingPromiseAction((userId, iri, access) => ({
    type: ALTER_PERMISSION,
    payload: PermissionAPI.alterPermission(userId, iri, access),
    meta: {
        subject: userId,
        iri,
        access
    }
}));
