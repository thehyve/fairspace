import PermissionAPI from '../services/PermissionAPI/PermissionAPI'
import {createErrorHandlingPromiseAction} from "../utils/redux";

export const fetchPermissions = createErrorHandlingPromiseAction((collectionId) =>  ({
        type: "PERMISSIONS",
        payload: PermissionAPI.getCollectionPermissions(collectionId)
}));

