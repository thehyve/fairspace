import PermissionAPI from '../services/PermissionAPI/PermissionAPI'
import {createErrorHandlingPromiseAction} from "../utils/redux";
import {SHOW_CONFIRM_DELETE_DIALOG, SHOW_PERMISSION_DIALOG} from "./actionTypes";

export const fetchPermissions = createErrorHandlingPromiseAction((collectionId) =>  ({
        type: "PERMISSIONS",
        payload: PermissionAPI.getCollectionPermissions(collectionId)
    }));

export const showPermissionDialog = () => {
    return {
        type: SHOW_PERMISSION_DIALOG
    }
};

export const showConfirmDeleteDialog = () => {
    return {
        type: SHOW_CONFIRM_DELETE_DIALOG
    }
};

