import PermissionAPI from '../services/PermissionAPI/PermissionAPI'
import {createErrorHandlingPromiseAction, dispatchIfNeeded} from "../utils/redux";
import {ALTER_PERMISSION, PERMISSIONS} from "./actionTypes";

export const fetchPermissions = createErrorHandlingPromiseAction((collectionId, useCache = true) =>  ({
    type: PERMISSIONS,
    payload: PermissionAPI.getCollectionPermissions(collectionId, useCache),
    meta: {
        collectionId
    }
}));

export const fetchPermissionsIfNeeded = (collectionId, useCache = true) => dispatchIfNeeded(
    () => fetchPermissions(collectionId, useCache),
    state => state && state.cache && state.cache.permissionsByCollectionId ? state.cache.permissionsByCollectionId[collectionId]: undefined
);

export const alterPermission = createErrorHandlingPromiseAction((userId, collectionId, access) => ({
    type: ALTER_PERMISSION,
    payload: PermissionAPI.alterCollectionPermission(userId,  collectionId, access),
    meta: {
        userId,
        collectionId,
        access
    }
}));

