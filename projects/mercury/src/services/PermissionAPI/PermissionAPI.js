import {format} from 'util';
import Config from '../Config/Config';
import {failOnHttpError} from "../../utils/httputils";

class PermissionAPI {
    static changeHeaders = new Headers({'Content-Type': 'application/json'});

    static getHeaders = new Headers({Accept: 'application/json'});

    /**
     * Retrieves a list of permissions for a specific collection.
     * @param collectionId The id of the collection.
     * @returns A Promise returning an array of user permissions, not including users with None permissions.
     */
    getCollectionPermissions(collectionId, useCache = true) {
        const url = format(Config.get().urls.permissionsByCollectionId, collectionId);
        return fetch(url, {
            method: 'GET',
            header: PermissionAPI.getHeaders,
            credentials: 'same-origin',
            cache: useCache ? 'default' : 'reload'
        })
            .then(failOnHttpError('Error while loading collection permissions'))
            .then(response => response.json());
    }

    alterCollectionPermission(userId, collectionId, access) {
        if (!userId || !collectionId || !access) {
            return Promise.reject("No userId, collectionId or access given");
        }
        return fetch(Config.get().urls.permissions, {
            method: 'PUT',
            headers: PermissionAPI.changeHeaders,
            credentials: 'same-origin',
            body: JSON.stringify({subject: userId, collection: collectionId, access})
        })
            .then(failOnHttpError("Failure while alter a collection's permission"))
            .then(response => response.json());
    }

    removeUserFromCollectionPermission(userId, collectionId) {
        return this.alterCollectionPermission(userId, collectionId, 'None');
    }
}

export default new PermissionAPI();
